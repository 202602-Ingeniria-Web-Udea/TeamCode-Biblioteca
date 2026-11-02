import { obtenerUsuario } from '@/lib/auth';
import { crearLibro } from '@/lib/inventario';
import { datosLibro } from '@/lib/validaciones/inventario';
import { Prisma } from '@/app/generated/prisma/client';
export const POST = async (request: Request) => {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  try {
    const usuario = await obtenerUsuario();
    if (!usuario) return Response.json({ error: 'Inicia sesión nuevamente.' }, { status: 401 });
    if (usuario.rol !== 'ADMIN') return Response.json({ error: 'Solo un administrador puede crear libros.' }, { status: 403 });
    const datos = datosLibro.safeParse(await request.json());
    if (!datos.success) return Response.json({ error: 'Completa los campos y revisa la cantidad inicial.' }, { status: 400 });
    const libro = await crearLibro(datos.data, usuario.id);
    return Response.json({ mensaje: 'Libro creado correctamente.', id: libro.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return Response.json({ error: 'Los datos no son válidos.' }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return Response.json({ error: 'Ya existe un libro con ese ISBN.' }, { status: 409 });
    return Response.json({ error: 'No se pudo guardar el libro. Intenta nuevamente.' }, { status: 500 });
  }
};
