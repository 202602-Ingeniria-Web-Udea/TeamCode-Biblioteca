# TeamCode-Biblioteca
Aplicación fullstack para gestionar libros, usuarios, préstamos, devoluciones y reservas. Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Prisma y PostgreSQL en Supabase.

## Funciones
- Foto de perfil desde la barra lateral para ambos roles: subir JPG, PNG o WebP de hasta 2 MB o quitarla. Se valida y convierte en el servidor a un retrato de 256 × 256; se conserva en Supabase sin depender del disco de Vercel.
- Landing, registro público, inicio de sesión y cierre de sesión. Contraseñas con bcrypt y sesiones firmadas de ocho horas en cookies HttpOnly.
- Roles ADMIN y USER comprobados en el servidor, con el rol actual leído desde la base de datos.
- Catálogo con búsqueda por título o autor. ADMIN puede crear, editar, desactivar y reactivar libros. El historial se conserva; no se permite desactivar un libro con préstamos activos o reservas pendientes.
- Entradas y salidas para ambos roles. Cada movimiento guarda fecha, cantidad y responsable. Saldo y movimiento se actualizan en una transacción, sin existencias negativas.
- Gráfica de saldos al cierre de cada día, hasta los últimos 30 días, con hora de Colombia y saldo acumulado anterior al período.
- ADMIN crea usuarios y cambia roles. No puede cambiar su propio rol y debe quedar un administrador activo. Nunca se muestran contraseñas ni hashes en las tablas o respuestas.
- Préstamos con fecha límite y devolución completa. La devolución repetida se rechaza y no duplica existencias.
- Reservas pendientes, atendidas o canceladas. Una reserva es una solicitud y no garantiza ni descuenta existencias. Solo ADMIN puede atenderla: se crea el préstamo y la salida correspondiente en una misma transacción.
- USER gestiona sus propios préstamos y reservas; ADMIN puede gestionar los de todos los lectores activos. Los movimientos manuales de inventario siguen disponibles para ambos roles.
- Formularios con carga, mensajes de éxito o error, cancelación y actualización de las tablas al guardar. Diseño adaptable en verde salvia y crema con shadcn/ui.

## Ejecutar
1. `npm install`.
2. Crear `.env` tomando `.env.example` como referencia. Codificar caracteres especiales de la contraseña en las URLs y no subir el `.env` real al repositorio.
3. `npm run db:generate`.
4. `npm run db:deploy` para aplicar las migraciones existentes.
5. `npm run db:seed` para crear las cuentas de demostración ausentes.
6. `npm run dev` y abrir localhost:3000.

La aplicación usa DATABASE_URL. Las migraciones y el seed usan DIRECT_URL, con conexión directa o de sesión, sin pool de transacciones. SESSION_SECRET debe ser una clave aleatoria de al menos 32 caracteres. El proyecto usa Prisma 7 y su configuración está en prisma7.config.ts.

## Cuentas para evaluación
| Rol | Correo | Contraseña |
| --- | --- | --- |
| ADMIN | admin@biblioteca.com | Biblioteca2026! |
| USER | usuario@biblioteca.com | Lectura2026! |
El seed conserva las cuentas que ya existan. También se pueden crear cuentas desde Usuarios entrando como ADMIN. El registro público está disponible en /registro, desde el enlace Crear cuenta del login. Siempre asigna USER, exige confirmar la contraseña y dirige al login al terminar.

## Organización
- `app`: páginas y rutas HTTP. `(auth)` para login y `(panel)` para secciones protegidas.
- `components/atoms`, `components/molecules`, `components/organisms`: componentes propios con props explícitas, `const index` y `export default index`.
- `components/ui`: componentes oficiales de shadcn/ui, que conservan su estructura de librería.
- `lib`: conexión, autenticación, operaciones de inventario y circulación, respuestas y validaciones.
- `utils`: navegación, acciones y formato de fechas y saldos.
- `prisma`: modelos en español, migraciones y datos iniciales.
- `tests`: saldos, concurrencia, permisos y recorridos HTTP.

Las páginas y el panel tienen límites Suspense locales para que las lecturas de sesión y base de datos no bloqueen las navegaciones sin una pantalla de carga. No se usa caché compartida para los permisos.

## Verificación
- `npm run lint`.
- `npm run typecheck`.
- `npm test`: pruebas de saldos; las pruebas con base de datos se omiten por defecto.
- Con `RUN_DATABASE_TESTS=1`: prueba de concurrencia del inventario en Supabase.
- Con `RUN_HTTP_TESTS=1`: pruebas HTTP contra el servidor de desarrollo; `TEST_BASE_URL` permite cambiar localhost:3000. Requieren las cuentas de demostración. Crean y eliminan exclusivamente sus propios registros temporales.
- `npm run build`: genera el cliente Prisma y compila la aplicación con Webpack.

La prueba completa cubre edición sin cambios directos de saldo, desactivación/reactivación, creación de cuenta y login, permisos y cambios de rol con una sesión existente, préstamo, devolución única, reserva, atención y cancelación, falta de existencias y operaciones simultáneas.

## Publicar en Vercel
1. Subir el proyecto al repositorio de la organización de la clase.
2. Importar el repositorio en Vercel como aplicación Next.js.
3. Configurar DATABASE_URL, DIRECT_URL y SESSION_SECRET en las variables de entorno.
4. Aplicar las migraciones con `npm run db:deploy`; ejecutar el seed si esa base todavía no tiene las cuentas para evaluación.
5. Publicar con el comando de compilación `npm run build` y comprobar ambos roles en el enlace público.

## Datos pendientes de entrega
- Nombre del equipo e integrantes.
- Repositorio de la organización y acceso del profesor.
- Nombre y enlace público del proyecto en Vercel.
Estos datos y la publicación requieren la cuenta y la información del equipo; no se inventaron ni se publicaron desde este proyecto local.

Repositorio del proyecto: https://github.com/juanparra23/TeamCode-Biblioteca. Confirmar el traslado a la organización de la clase antes de la entrega.

## Registro público
El formulario usa los componentes shadcn/ui y valida nombre, apellido, correo y contraseña con confirmación. El servidor valida los mismos campos, normaliza el correo y protege la contraseña con bcrypt. No acepta el campo rol: se asigna USER en el servidor. Se rechazan correos repetidos y peticiones de otros orígenes.

La prueba HTTP de registro cubre creación, login posterior, correo normalizado y duplicado, contraseña inválida o sin coincidencia, intento de elevar el rol, contraseña protegida y permisos limitados de la cuenta creada. La cuenta temporal se retira al terminar.
