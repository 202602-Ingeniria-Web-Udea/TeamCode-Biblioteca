'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Plus, LoaderCircle } from 'lucide-react';
const index = ({ libroId, titulo, existencias }: { libroId: string; titulo: string; existencias: number }) => {
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
      const respuesta = await fetch('/api/movimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ libroId, tipo: datos.get('tipo'), cantidad: Number(datos.get('cantidad')), observaciones: datos.get('observaciones') }) });
      const resultado = await respuesta.json();
      if (!respuesta.ok) { setError(resultado.error); return; }
      formulario.reset(); setAbierto(false); setMensaje(resultado.mensaje); router.refresh();
    } catch { setError('No pudimos conectarnos. Intenta nuevamente.'); }
    finally { setCargando(false); }
  };
  return <div><Dialog open={abierto} onOpenChange={valor => { if (!cargando) setAbierto(valor); }}><DialogTrigger asChild><Button className="boton" onClick={() => { setError(''); setMensaje(''); setAbierto(true); }}><Plus size={18} />Agregar movimiento</Button></DialogTrigger>{mensaje && <Alert role="status" className="exito"><AlertDescription>{mensaje}</AlertDescription></Alert>}<DialogContent className="dialogo" onEscapeKeyDown={evento => { if (cargando) evento.preventDefault(); }} onInteractOutside={evento => { if (cargando) evento.preventDefault(); }}><DialogHeader><DialogTitle>{titulo}</DialogTitle><DialogDescription>Disponibles: {existencias} ejemplares. Registra una entrada o salida de inventario.</DialogDescription></DialogHeader><form className="formulario" onSubmit={guardar} aria-busy={cargando}><fieldset disabled={cargando}><div className="campo"><Label htmlFor="tipo-movimiento">Tipo de movimiento</Label><Select name="tipo" defaultValue="ENTRADA" disabled={cargando}><SelectTrigger id="tipo-movimiento" className="control"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ENTRADA">Entrada</SelectItem><SelectItem value="SALIDA">Salida</SelectItem></SelectContent></Select></div><div className="campo"><Label htmlFor="cantidad-movimiento">Cantidad de ejemplares</Label><Input id="cantidad-movimiento" name="cantidad" type="number" min={1} max={1000000} step={1} required defaultValue={1} autoFocus /></div><div className="campo"><Label htmlFor="observaciones-movimiento">Observaciones (opcional)</Label><Textarea id="observaciones-movimiento" name="observaciones" maxLength={500} rows={3} /></div></fieldset>{error && <Alert variant="destructive" className="error"><AlertDescription>{error}</AlertDescription></Alert>}<DialogFooter className="acciones"><Button type="button" className="boton boton-claro" disabled={cargando} onClick={() => setAbierto(false)}>Cancelar</Button><Button className="boton" disabled={cargando}>{cargando && <LoaderCircle size={18} className="girar" />}{cargando ? 'Guardando…' : 'Crear movimiento'}</Button></DialogFooter></form></DialogContent></Dialog></div>;
};
export default index;
