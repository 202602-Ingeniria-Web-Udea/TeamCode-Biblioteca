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
const index = () => {
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
      const respuesta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          apellido: datos.get("apellido"),
          correo: datos.get("correo"),
          contrasena: datos.get("contrasena"),
          rol: datos.get("rol"),
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
            Crear usuario
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
            <DialogTitle>Crear usuario</DialogTitle>
            <DialogDescription>
              Crea una cuenta para acceder a la biblioteca.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="formulario" aria-busy={cargando}>
            <fieldset disabled={cargando}>
              <div className="campo">
                <Label htmlFor="usuario-nombre">Nombre</Label>
                <Input
                  id="usuario-nombre"
                  name="nombre"
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="given-name"
                />
              </div>
              <div className="campo">
                <Label htmlFor="usuario-apellido">Apellido</Label>
                <Input
                  id="usuario-apellido"
                  name="apellido"
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="family-name"
                />
              </div>
              <div className="campo">
                <Label htmlFor="usuario-correo">Correo electrónico</Label>
                <Input
                  id="usuario-correo"
                  name="correo"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                />
              </div>
              <div className="campo">
                <Label htmlFor="usuario-contrasena">Contraseña</Label>
                <Input
                  id="usuario-contrasena"
                  name="contrasena"
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                />
              </div>
              <div className="campo">
                <Label htmlFor="usuario-rol">Rol</Label>
                <Select name="rol" defaultValue="USER" disabled={cargando}>
                  <SelectTrigger id="usuario-rol" className="control">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER · Usuario</SelectItem>
                    <SelectItem value="ADMIN">ADMIN · Administrador</SelectItem>
                  </SelectContent>
                </Select>
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
                {cargando ? "Guardando…" : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default index;
