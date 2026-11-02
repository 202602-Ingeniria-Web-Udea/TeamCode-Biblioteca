"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import Campo from "@/components/molecules/campo";
const index = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- El componente usa el nombre index solicitado y se importa con nombre mayusculo.
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- El componente usa el nombre index solicitado y se importa con nombre mayusculo.
  const [cargando, setCargando] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- El componente usa el nombre index solicitado y se importa con nombre mayusculo.
  const [error, setError] = useState("");
  const ingresar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setCargando(true);
    setError("");
    const datos = new FormData(evento.currentTarget);
    try {
      const respuesta = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: datos.get("correo"),
          contrasena: datos.get("contrasena"),
        }),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        setError(resultado.error);
        return;
      }
      router.replace("/inicio");
      router.refresh();
    } catch {
      setError("No pudimos conectarnos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };
  return (
    <form onSubmit={ingresar} className="formulario">
      <Campo
        nombre="correo"
        titulo="Correo electrónico"
        tipo="email"
        ejemplo="tu@correo.com"
      />
      <Campo
        nombre="contrasena"
        titulo="Contraseña"
        tipo="password"
        ejemplo="Tu contraseña"
      />
      {error && (
        <Alert variant="destructive" className="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button className="boton" disabled={cargando}>
        {cargando ? (
          <LoaderCircle className="girar" size={18} />
        ) : (
          <ArrowRight size={18} />
        )}
        {cargando ? "Ingresando…" : "Iniciar sesión"}
      </Button>
      <p className="texto-suave texto-pequeno">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="enlace-texto">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
};
export default index;
