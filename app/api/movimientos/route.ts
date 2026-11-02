import { obtenerUsuario } from '@/lib/auth';
import { registrarMovimiento } from '@/lib/inventario';
import { datosMovimiento } from '@/lib/validaciones/inventario';
export const POST = async (request: Request) => {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  try {
    const usuario = await obtenerUsuario();
    if (!usuario) return Response.json({ error: 'Inicia sesión nuevamente.' }, { status: 401 });
    const datos = datosMovimiento.safeParse(await request.json());
    if (!datos.success) return Response.json({ error: 'Selecciona un libro y una cantidad entera mayor que cero.' }, { status: 400 });
    await registrarMovimiento(datos.data, usuario.id);
    return Response.json({ mensaje: 'Movimiento registrado correctamente.' }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: 'Los datos no son válidos.' }, { status: 400 });
    if (error instanceof Error && error.message === 'SALDO_NO_DISPONIBLE') return Response.json({ error: 'No hay existencias suficientes, el libro ya no está activo o la entrada supera el límite permitido.' }, { status: 409 });
    return Response.json({ error: 'No se pudo registrar el movimiento. Intenta nuevamente.' }, { status: 500 });
  }
};
