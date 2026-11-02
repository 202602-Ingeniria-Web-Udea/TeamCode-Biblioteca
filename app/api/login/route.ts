import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { crearSesion } from '@/lib/auth';
import { datosLogin } from '@/lib/validaciones/usuario';
export const POST = async (request: Request) => {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  try {
    const datos = datosLogin.safeParse(await request.json());
    if (!datos.success) return Response.json({ error: 'Revisa el correo y la contraseña.' }, { status: 400 });
    const usuario = await prisma.usuarios.findUnique({ where: { correo: datos.data.correo } });
    if (!usuario || !usuario.activo || !await compare(datos.data.contrasena, usuario.contrasenaHash)) return Response.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    await crearSesion(usuario.id);
    return Response.json({ mensaje: 'Bienvenido.' });
  } catch { return Response.json({ error: 'No pudimos iniciar sesión. Intenta nuevamente.' }, { status: 500 }); }
};
