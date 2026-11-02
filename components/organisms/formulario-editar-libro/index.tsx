"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Pencil, LoaderCircle } from "lucide-react";
const index = ({
  id,
  titulo,
  autor,
  categoria,
  isbn,
}: {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  isbn: string | null;
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [abierto, setAbierto] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [cargando, setCargando] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [error, setError] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [mensaje, setMensaje] = useState("");
  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (cargando) return;
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const respuesta = await fetch("/api/libros/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: datos.get("titulo"),
          autor: datos.get("autor"),
          categoria: datos.get("categoria"),
          isbn: datos.get("isbn"),
        }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setError(resultado.error);
        return;
      }
      setAbierto(false);
      setMensaje(resultado.mensaje);
      router.refresh();
    } catch {
      setError("No pudimos conectarnos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };
  return (
    <div>
      <Dialog
        open={abierto}
        onOpenChange={(valor) => {
          if (!cargando) setAbierto(valor);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setMensaje("");
              setAbierto(true);
            }}
          >
            <Pencil size={16} />
            Editar libro
          </Button>
        </DialogTrigger>
        {mensaje && (
          <Alert role="status" className="exito">
            <AlertDescription>{mensaje}</AlertDescription>
          </Alert>
        )}
        <DialogContent
          className="dialogo"
          onEscapeKeyDown={(evento) => {
            if (cargando) evento.preventDefault();
          }}
          onInteractOutside={(evento) => {
            if (cargando) evento.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Editar libro</DialogTitle>
            <DialogDescription>
              Las existencias se actualizan desde Movimientos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="formulario" aria-busy={cargando}>
            <fieldset disabled={cargando}>
              <div className="campo">
                <Label htmlFor={"editar-titulo-" + id}>Título</Label>
                <Input
                  id={"editar-titulo-" + id}
                  defaultValue={titulo}
                  name="titulo"
                  required
                  maxLength={180}
                  autoFocus
                />
              </div>
              <div className="campo">
                <Label htmlFor={"editar-autor-" + id}>Autor</Label>
                <Input
                  id={"editar-autor-" + id}
                  defaultValue={autor}
                  name="autor"
                  required
                  maxLength={150}
                />
              </div>
              <div className="campo">
                <Label htmlFor={"editar-categoria-" + id}>Categoría</Label>
                <Input
                  id={"editar-categoria-" + id}
                  defaultValue={categoria}
                  name="categoria"
                  required
                  maxLength={80}
                  placeholder="Por ejemplo: Novela"
                />
              </div>
              <div className="campo">
                <Label htmlFor={"editar-isbn-" + id}>ISBN (opcional)</Label>
                <Input
                  id={"editar-isbn-" + id}
                  defaultValue={isbn ?? ""}
                  name="isbn"
                  maxLength={30}
                />
              </div>
            </fieldset>
            {error && (
              <Alert variant="destructive" className="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="acciones">
              <Button
                type="button"
                className="boton boton-claro"
                disabled={cargando}
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </Button>
              <Button className="boton" disabled={cargando}>
                {cargando && <LoaderCircle size={18} className="girar" />}
                {cargando ? "Guardando…" : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default index;
