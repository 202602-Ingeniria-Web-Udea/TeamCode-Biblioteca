import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { BookOpen, BookMarked, CalendarDays, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { requerirUsuario } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const Contenido = async () => {
  const usuario = await requerirUsuario();
  const [libros, prestamos, reservas] = await Promise.all([
    prisma.libros.count({ where: { activo: true } }),
    prisma.prestamos.count({ where: { fechaDevolucion: null } }),
    prisma.reservas.count({ where: { estado: "PENDIENTE" } }),
  ]);
  const tarjetas = [
    { titulo: "Títulos en el catálogo", valor: libros, icono: BookOpen },
    { titulo: "Préstamos activos", valor: prestamos, icono: BookMarked },
    { titulo: "Reservas pendientes", valor: reservas, icono: CalendarDays },
  ];
  return (
    <>
      <p className="etiqueta">TU ESPACIO DE LECTURA</p>
      <h1>
        Hola, {usuario.nombre}
        <span className="marca-punto">.</span>
      </h1>
      <p className="texto-suave">
        Todo lo que necesitas para organizar tu biblioteca.
      </p>
      <div className="estadisticas">
        {tarjetas.map((tarjeta) => (
          <Card className="tarjeta" key={tarjeta.titulo}>
            <tarjeta.icono size={24} />
            <p>{tarjeta.titulo}</p>
            <strong className="numero">{tarjeta.valor}</strong>
          </Card>
        ))}
      </div>
      <section className="bienvenida">
        <span className="insignia">CADA LIBRO, UNA POSIBILIDAD</span>
        <h2>
          Las buenas historias
          <br />
          merecen un lugar.
        </h2>
        <p>Explora el catálogo y encuentra tu siguiente lectura.</p>
        <Button asChild>
          <Link className="boton" href="/libros">
            Explorar libros
            <ArrowUpRight size={18} />
          </Link>
        </Button>
      </section>
    </>
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
