import { Suspense } from "react";
import { requerirUsuario } from "@/lib/auth";
import Sidebar from "@/components/organisms/sidebar";

const PanelAutenticado = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const usuario = await requerirUsuario();
  return (
    <div className="panel">
      <Sidebar nombre={usuario.nombre} rol={usuario.rol} foto={usuario.foto} />
      <main className="panel-contenido">{children}</main>
    </div>
  );
};

const index = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <p role="status" className="texto-suave">
        Comprobando tu sesión…
      </p>
    }
  >
    <PanelAutenticado>{children}</PanelAutenticado>
  </Suspense>
);
export default index;
