const index = ({ nombre, foto }: { nombre: string; foto: string | null }) => (
  <span className="avatar">
    {foto ? (
      // eslint-disable-next-line @next/next/no-img-element -- Foto pequeña guardada como data URI; no necesita optimización remota.
      <img
        src={foto}
        alt={"Foto de " + nombre}
        width={39}
        height={39}
        className="foto-usuario"
      />
    ) : (
      nombre.charAt(0).toUpperCase()
    )}
  </span>
);
export default index;
