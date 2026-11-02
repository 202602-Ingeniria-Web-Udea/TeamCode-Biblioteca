import { cookies } from 'next/headers';
export const POST = async (request: Request) => {
  if (request.headers.get('origin') !== new URL(request.url).origin) return new Response(null, { status: 403 });
  (await cookies()).delete('biblioteca_sesion');
  return Response.json({ mensaje: 'Sesión cerrada.' });
};
