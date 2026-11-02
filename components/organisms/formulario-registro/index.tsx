"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const index = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [cargando, setCargando] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [error, setError] = useState("");
  const registrar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (cargando) return;
    const datos = new FormData(evento.currentTarget);
    if (datos.get("contrasena") !== datos.get("confirmacion")) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          apellido: datos.get("apellido"),
          correo: datos.get("correo"),
          contrasena: datos.get("contrasena"),
          confirmacion: datos.get("confirmacion"),
        }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setError(resultado.error);
        return;
      }
      router.replace("/login?registro=exitoso");
      router.refresh();
    } catch {
      setError("No pudimos conectarnos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };
  return (
    <form onSubmit={registrar} className="formulario" aria-busy={cargando}>
      <fieldset disabled={cargando}>
        <div className="campo">
          <Label htmlFor="registro-nombre">Nombre</Label>
          <Input
            id="registro-nombre"
            name="nombre"
            autoComplete="given-name"
            required
            maxLength={80}
          />
        </div>
        <div className="campo">
          <Label htmlFor="registro-apellido">Apellido</Label>
          <Input
            id="registro-apellido"
            name="apellido"
            autoComplete="family-name"
            required
            maxLength={80}
          />
        </div>
        <div className="campo">
          <Label htmlFor="registro-correo">Correo electrónico</Label>
          <Input
            id="registro-correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </div>
        <div className="campo">
          <Label htmlFor="registro-contrasena">Contraseña</Label>
          <Input
            id="registro-contrasena"
            name="contrasena"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            aria-describedby="ayuda-contrasena"
          />
          <p id="ayuda-contrasena" className="texto-suave texto-pequeno">
            Usa al menos 8 caracteres.
          </p>
        </div>
        <div className="campo">
          <Label htmlFor="registro-confirmacion">Confirmar contraseña</Label>
          <Input
            id="registro-confirmacion"
            name="confirmacion"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </div>
      </fieldset>
      {error && (
        <Alert variant="destructive" className="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button className="boton" disabled={cargando}>
        {cargando ? (
          <LoaderCircle className="girar" size={18} />
        ) : (
          <UserPlus size={18} />
        )}
        {cargando ? "Creando tu cuenta…" : "Crear cuenta"}
      </Button>
      <p className="texto-suave texto-pequeno">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="enlace-texto">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
};
export default index;
