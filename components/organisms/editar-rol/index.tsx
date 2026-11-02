"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  correo,
  rol,
}: {
  id: string;
  correo: string;
  rol: "ADMIN" | "USER";
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
    const datos = { rol: new FormData(evento.currentTarget).get("rol") };
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const respuesta = await fetch("/api/usuarios/" + id, {
        method: "PATCH",
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
            {"Editar rol"}
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
            <DialogTitle>{"Editar rol"}</DialogTitle>
            <DialogDescription>{correo}</DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="formulario" aria-busy={cargando}>
            <Select name="rol" defaultValue={rol} disabled={cargando}>
              <SelectTrigger aria-label="Rol del usuario" className="control">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER · Usuario</SelectItem>
                <SelectItem value="ADMIN">ADMIN · Administrador</SelectItem>
              </SelectContent>
            </Select>
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
