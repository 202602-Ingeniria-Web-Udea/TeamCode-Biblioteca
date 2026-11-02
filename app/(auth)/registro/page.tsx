import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Marca from "@/components/atoms/marca";
import FormularioRegistro from "@/components/organisms/formulario-registro";
import { obtenerUsuario } from "@/lib/auth";
const Contenido = async () => {
  if (await obtenerUsuario()) redirect("/inicio");
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
          <span className="etiqueta">TU PRÓXIMA HISTORIA EMPIEZA AQUÍ</span>
          <h2>Crea tu cuenta</h2>
          <p className="texto-suave">
            Regístrate para reservar libros y gestionar tus lecturas.
          </p>
          <FormularioRegistro />
        </div>
        <p className="texto-suave texto-pequeno">
          Un pequeño espacio para grandes historias.
        </p>
      </section>
    </main>
  );
};
const index = () => (
  <Suspense
    fallback={
      <p role="status" className="texto-suave">
        Cargando tu biblioteca…
      </p>
    }
  >
    <Contenido />
  </Suspense>
);
export default index;
