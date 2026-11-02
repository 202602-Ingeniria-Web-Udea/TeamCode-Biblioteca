"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accionesBiblioteca } from "@/utils/acciones-biblioteca";

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
  tipo,
  fechaHoy,
}: {
  id: string;
  titulo: string;
  tipo: "DEVOLVER" | "CANCELAR" | "ATENDER";
  fechaHoy: string;
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
    const datos =
      tipo === "ATENDER"
        ? {
            accion: "ATENDER",
            fechaLimite: new FormData(evento.currentTarget).get("fechaLimite"),
          }
        : { accion: "CANCELAR" };
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const respuesta = await fetch(
        "/api/" + (tipo === "DEVOLVER" ? "prestamos/" : "reservas/") + id,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        },
      );
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
            {accionesBiblioteca[tipo]}
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
            <DialogTitle>{accionesBiblioteca[tipo]}</DialogTitle>
            <DialogDescription>
              {titulo +
                (tipo === "DEVOLVER"
                  ? ". Se devolverán todos los ejemplares de este préstamo."
                  : tipo === "ATENDER"
                    ? ". Se creará el préstamo si hay suficientes ejemplares."
                    : ". La solicitud quedará cancelada.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="formulario" aria-busy={cargando}>
            {tipo === "ATENDER" && (
              <div className="campo">
                <Label htmlFor={"fecha-reserva-" + id}>
                  Fecha límite de devolución
                </Label>
                <Input
                  id={"fecha-reserva-" + id}
                  type="date"
                  name="fechaLimite"
                  min={fechaHoy}
                  required
                  disabled={cargando}
                />
              </div>
            )}
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
