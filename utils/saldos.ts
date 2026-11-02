type Movimiento = { fechaCreacion: Date; cantidad: number; tipo: 'ENTRADA' | 'SALIDA' };
const diaLocal = (fecha: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(fecha);
export const calcularSaldos = (movimientos: Movimiento[], hoy = new Date()) => {
  if (!movimientos.length) return [];
  const porDia = new Map<string, number>();
  for (const movimiento of movimientos) { const dia = diaLocal(movimiento.fechaCreacion); porDia.set(dia, (porDia.get(dia) ?? 0) + (movimiento.tipo === 'ENTRADA' ? movimiento.cantidad : -movimiento.cantidad)); }
  const fin = diaLocal(hoy);
  const inicio = new Date(fin + 'T12:00:00Z'); inicio.setUTCDate(inicio.getUTCDate() - 29);
  const primerDia = [...porDia.keys()].sort()[0];
  let cursor = diaLocal(inicio) > primerDia ? diaLocal(inicio) : primerDia;
  let saldo = 0;
  for (const [dia, cambio] of porDia) if (dia < cursor) saldo += cambio;
  const datos: { fecha: string; saldo: number }[] = [];
  while (cursor <= fin) {
    saldo += porDia.get(cursor) ?? 0; datos.push({ fecha: cursor, saldo });
    const siguiente = new Date(cursor + 'T12:00:00Z'); siguiente.setUTCDate(siguiente.getUTCDate() + 1); cursor = diaLocal(siguiente);
  }
  return datos;
};
