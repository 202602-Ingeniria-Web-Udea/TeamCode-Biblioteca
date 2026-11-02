"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import FotoUsuario from "@/components/atoms/foto-usuario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const index = ({ nombre, foto }: { nombre: string; foto: string | null }) => {
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

  const guardar = async (datos: FormData | null) => {
    if (cargando) return;
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const respuesta = await fetch("/api/perfil/foto", {
        method: datos ? "POST" : "DELETE",
        body: datos,
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setError(resultado.error);
        return;
      }
      setMensaje(resultado.mensaje);
      setAbierto(false);
      router.refresh();
    } catch {
      setError("No pudimos conectarnos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };
  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const archivo = datos.get("foto");
    if (
      !(archivo instanceof File) ||
      !archivo.size ||
      archivo.size > 2 * 1024 * 1024
    ) {
      setError("Selecciona una foto de máximo 2 MB.");
      return;
    }
    void guardar(datos);
  };
  return (
    <div>
      <Dialog
        open={abierto}
        onOpenChange={(valor) => {
          if (!cargando) {
            setAbierto(valor);
            setError("");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Camera size={16} />
            Cambiar foto
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
            <DialogTitle>Tu foto de perfil</DialogTitle>
            <DialogDescription>
              Selecciona una imagen JPG, PNG o WebP de máximo 2 MB.
            </DialogDescription>
          </DialogHeader>
          <FotoUsuario nombre={nombre} foto={foto} />
          <form onSubmit={enviar} className="formulario" aria-busy={cargando}>
            <div className="campo">
              <Label htmlFor="foto-perfil">Foto</Label>
              <Input
                id="foto-perfil"
                name="foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                disabled={cargando}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              {foto && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={cargando}
                  onClick={() => void guardar(null)}
                >
                  Quitar foto
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={cargando}
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </Button>
              <Button disabled={cargando}>
                {cargando ? "Guardando…" : "Guardar foto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {mensaje && (
        <p role="status" className="texto-pequeno">
          {mensaje}
        </p>
      )}
    </div>
  );
};
export default index;
