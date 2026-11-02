export const formatearFecha = (fecha: Date) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' }).format(fecha);
