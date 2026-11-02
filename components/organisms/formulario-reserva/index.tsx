"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import { Plus, LoaderCircle } from "lucide-react";
const index = ({
  libros,
  lectores,
  esAdmin,
  usuarioId,
}: {
  libros: { id: string; titulo: string; existencias: number }[];
  lectores: { id: string; nombre: string }[];
  esAdmin: boolean;
  usuarioId: string;
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
      const respuesta = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libroId: datos.get("libroId"),
          lectorId: esAdmin ? datos.get("lectorId") : usuarioId,
          cantidad: Number(datos.get("cantidad")),
        }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setError(resultado.error);
        return;
      }
      formulario.reset();
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
            className="boton"
            onClick={() => {
              setError("");
              setMensaje("");
              setAbierto(true);
            }}
          >
            <Plus size={18} />
            Crear reserva
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
            <DialogTitle>Crear reserva</DialogTitle>
            <DialogDescription>
              La reserva es una solicitud: no descuenta ni garantiza
              existencias.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="formulario" aria-busy={cargando}>
            <fieldset disabled={cargando}>
              <div className="campo">
                <Label htmlFor="circulacion-libro">Libro</Label>
                <Select name="libroId" required disabled={cargando}>
                  <SelectTrigger id="circulacion-libro" className="control">
                    <SelectValue placeholder="Selecciona un libro" />
                  </SelectTrigger>
                  <SelectContent>
                    {libros.map((libro) => (
                      <SelectItem key={libro.id} value={libro.id}>
                        {libro.titulo} · {libro.existencias} disponibles
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {esAdmin && (
                <div className="campo">
                  <Label htmlFor="circulacion-lector">Lector</Label>
                  <Select
                    name="lectorId"
                    defaultValue={usuarioId}
                    required
                    disabled={cargando}
                  >
                    <SelectTrigger id="circulacion-lector" className="control">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lectores.map((lector) => (
                        <SelectItem key={lector.id} value={lector.id}>
                          {lector.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="campo">
                <Label htmlFor="circulacion-cantidad">
                  Cantidad de ejemplares
                </Label>
                <Input
                  id="circulacion-cantidad"
                  name="cantidad"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={1000000}
                  step={1}
                  required
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
                {cargando ? "Guardando…" : "Crear reserva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default index;
