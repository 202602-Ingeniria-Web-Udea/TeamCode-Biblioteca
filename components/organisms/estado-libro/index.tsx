"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
const index = ({
  id,
  titulo,
  activo,
}: {
  id: string;
  titulo: string;
  activo: boolean;
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [abierto, setAbierto] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [cargando, setCargando] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [error, setError] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [mensaje, setMensaje] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const router = useRouter();
  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (cargando) return;
    const datos = { accion: "ACTIVAR" };
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const respuesta = await fetch("/api/libros/" + id, {
        method: activo ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
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
            }}
          >
            {activo ? "Desactivar libro" : "Reactivar libro"}
          </Button>
        </DialogTrigger>
        <DialogContent
          className="dialogo"
          onEscapeKeyDown={(e) => {
            if (cargando) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (cargando) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {activo ? "Desactivar libro" : "Reactivar libro"}
            </DialogTitle>
            <DialogDescription>
              {titulo +
                (activo
                  ? ". Se ocultará del catálogo y conservará su historial."
                  : ". Volverá a estar disponible en el catálogo.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="formulario" aria-busy={cargando}>
            {error && (
              <Alert variant="destructive" className="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={cargando}
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </Button>
              <Button disabled={cargando}>
                {cargando ? "Guardando…" : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {mensaje && (
        <p role="status" className="exito">
          {mensaje}
        </p>
      )}
    </div>
  );
};
export default index;
