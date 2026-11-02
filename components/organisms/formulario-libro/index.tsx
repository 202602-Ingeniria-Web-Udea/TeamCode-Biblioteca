'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Plus, LoaderCircle } from 'lucide-react';
const index = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [abierto, setAbierto] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [cargando, setCargando] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [error, setError] = useState('');
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [mensaje, setMensaje] = useState('');
  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault(); if (cargando) return;
    const formulario = evento.currentTarget; const datos = new FormData(formulario);
    setCargando(true); setError(''); setMensaje('');
    try {
      const respuesta = await fetch('/api/libros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: datos.get('titulo'), autor: datos.get('autor'), categoria: datos.get('categoria'), isbn: datos.get('isbn'), existencias: Number(datos.get('existencias')) }) });
      const resultado = await respuesta.json();
      if (!respuesta.ok) { setError(resultado.error); return; }
      formulario.reset(); setAbierto(false); setMensaje(resultado.mensaje); router.refresh();
    } catch { setError('No pudimos conectarnos. Intenta nuevamente.'); }
    finally { setCargando(false); }
  };
  return <div><Dialog open={abierto} onOpenChange={valor => { if (!cargando) setAbierto(valor); }}><DialogTrigger asChild><Button className="boton" onClick={() => { setError(''); setMensaje(''); setAbierto(true); }}><Plus size={18} />Agregar libro</Button></DialogTrigger>{mensaje && <Alert role="status" className="exito"><AlertDescription>{mensaje}</AlertDescription></Alert>}<DialogContent className="dialogo" onEscapeKeyDown={evento => { if (cargando) evento.preventDefault(); }} onInteractOutside={evento => { if (cargando) evento.preventDefault(); }}><DialogHeader><DialogTitle>Agregar libro</DialogTitle><DialogDescription>Dale un lugar a una nueva historia.</DialogDescription></DialogHeader><form onSubmit={guardar} className="formulario" aria-busy={cargando}><fieldset disabled={cargando}><div className="campo"><Label htmlFor="nuevo-titulo">Título</Label><Input id="nuevo-titulo" name="titulo" required maxLength={180} autoFocus /></div><div className="campo"><Label htmlFor="nuevo-autor">Autor</Label><Input id="nuevo-autor" name="autor" required maxLength={150} /></div><div className="campo"><Label htmlFor="nueva-categoria">Categoría</Label><Input id="nueva-categoria" name="categoria" required maxLength={80} placeholder="Por ejemplo: Novela" /></div><div className="campo"><Label htmlFor="nuevo-isbn">ISBN (opcional)</Label><Input id="nuevo-isbn" name="isbn" maxLength={30} /></div><div className="campo"><Label htmlFor="nuevas-existencias">Ejemplares iniciales</Label><Input id="nuevas-existencias" name="existencias" type="number" min={0} max={1000000} step={1} defaultValue={0} required /></div></fieldset>{error && <Alert variant="destructive" className="error"><AlertDescription>{error}</AlertDescription></Alert>}<DialogFooter className="acciones"><Button type="button" className="boton boton-claro" disabled={cargando} onClick={() => setAbierto(false)}>Cancelar</Button><Button className="boton" disabled={cargando}>{cargando && <LoaderCircle size={18} className="girar" />}{cargando ? 'Guardando…' : 'Crear libro'}</Button></DialogFooter></form></DialogContent></Dialog></div>;
};
export default index;
