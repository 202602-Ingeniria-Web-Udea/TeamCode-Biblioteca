"use client";
import { Button } from "@/components/ui/button";
const index = ({ reset }: { reset: () => void }) => (
  <section className="tarjeta">
    <h2>No pudimos cargar la información</h2>
    <p className="texto-suave">Revisa la conexión e intenta nuevamente.</p>
    <Button className="boton" onClick={reset}>
      Volver a intentar
    </Button>
  </section>
);
export default index;
