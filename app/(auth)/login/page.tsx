import { Alert, AlertDescription } from "@/components/ui/alert";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Marca from "@/components/atoms/marca";
import FormularioLogin from "@/components/organisms/formulario-login";
import { obtenerUsuario } from "@/lib/auth";
const Contenido = async ({
  searchParams,
}: {
  searchParams: Promise<{ registro?: string }>;
}) => {
  if (await obtenerUsuario()) redirect("/inicio");
  const parametros = await searchParams;
  return (
    <main className="login">
      <section className="login-presentacion">
        <Marca />
        <div>
          <span className="insignia">UN ESPACIO PARA DESCUBRIR</span>
          <h1>
            Una nueva historia
            <br />
            comienza aquí.
          </h1>
          <p>
            Todos tus libros, préstamos y descubrimientos, en un mismo lugar.
          </p>
          <div className="ilustracion">
            <BookOpen size={110} strokeWidth={1} />
            <span>Tu próxima lectura te espera.</span>
          </div>
        </div>
        <p className="texto-pequeno">Organiza. Descubre. Comparte.</p>
      </section>
      <section className="login-formulario">
        <Link href="/" className="volver">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
        <div className="login-contenido">
          <span className="etiqueta">QUÉ BUENO VERTE DE NUEVO</span>
          <h2>Bienvenido a tu biblioteca</h2>
          <p className="texto-suave">Ingresa tus datos para continuar.</p>
          {parametros.registro === "exitoso" && (
            <Alert role="status" className="exito">
              <AlertDescription>
                Tu cuenta fue creada. Ya puedes iniciar sesión.
              </AlertDescription>
            </Alert>
          )}
          <FormularioLogin />
        </div>
        <p className="texto-suave texto-pequeno">
          Un pequeño espacio para grandes historias.
        </p>
      </section>
    </main>
  );
};
const index = ({
  searchParams,
}: {
  searchParams: Promise<{ registro?: string }>;
}) => (
  <Suspense
    fallback={
      <p role="status" className="texto-suave">
        Cargando tu biblioteca…
      </p>
    }
  >
    <Contenido searchParams={searchParams} />
  </Suspense>
);
export default index;
