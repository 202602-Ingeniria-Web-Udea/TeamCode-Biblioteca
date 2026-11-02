import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { compare } from "bcryptjs";
import { prisma } from "../lib/prisma";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const enviar = (ruta: string, datos: object, cookie = "", method = "POST") =>
  fetch(base + ruta, {
    method,
    headers: { origin: base, "content-type": "application/json", cookie },
    body: JSON.stringify(datos),
  });
const login = async (correo: string, contrasena: string) => {
  const respuesta = await enviar("/api/login", { correo, contrasena });
  assert.equal(respuesta.status, 200);
  return respuesta.headers.get("set-cookie")!.split(";")[0];
};
test(
  "administracion y circulacion completas con permisos e historial",
  { skip: process.env.RUN_HTTP_TESTS !== "1" },
  async () => {
    let libroId: string | undefined;
    let usuarioId: string | undefined;
    try {
      const admin = await login("admin@biblioteca.com", "Biblioteca2026!");
      const user = await login("usuario@biblioteca.com", "Lectura2026!");
      const marcador = crypto.randomUUID();
      const datosLibro = {
        titulo: "Prueba completa " + marcador,
        autor: "Verificacion",
        categoria: "Pruebas",
        isbn: "",
        existencias: 3,
      };
      const creada = await enviar("/api/libros", datosLibro, admin);
      assert.equal(creada.status, 201);
      libroId = (await creada.json()).id;
      const edicion = {
        titulo: "Editado " + marcador,
        autor: "Autor editado",
        categoria: "Novela",
        isbn: "",
      };
      assert.equal(
        (await enviar("/api/libros/" + libroId, edicion, user, "PATCH")).status,
        403,
      );
      assert.equal(
        (await enviar("/api/libros/" + libroId, {}, user, "DELETE")).status,
        403,
      );
      assert.equal(
        (
          await enviar(
            "/api/libros/" + libroId,
            { ...edicion, existencias: 999 },
            admin,
            "PATCH",
          )
        ).status,
        400,
      );
      assert.equal(
        (await enviar("/api/libros/" + libroId, edicion, admin, "PATCH"))
          .status,
        200,
      );
      assert.equal(
        (await prisma.libros.findUniqueOrThrow({ where: { id: libroId } }))
          .existencias,
        3,
      );
      const datosUsuario = {
        nombre: "Prueba",
        apellido: "Temporal",
        correo: "prueba." + marcador + "@example.com",
        contrasena: "Prueba2026!",
        rol: "USER",
      };
      assert.equal(
        (await enviar("/api/usuarios", datosUsuario, user)).status,
        403,
      );
      assert.equal(
        (
          await enviar(
            "/api/usuarios",
            { ...datosUsuario, contrasena: "corta" },
            admin,
          )
        ).status,
        400,
      );
      const nueva = await enviar("/api/usuarios", datosUsuario, admin);
      assert.equal(nueva.status, 201);
      const resultado = await nueva.json();
      usuarioId = resultado.id;
      assert.equal("contrasenaHash" in resultado, false);
      assert.equal(
        (await enviar("/api/usuarios", datosUsuario, admin)).status,
        409,
      );
      const cuenta = await prisma.usuarios.findUniqueOrThrow({
        where: { id: usuarioId },
      });
      assert.ok(await compare(datosUsuario.contrasena, cuenta.contrasenaHash));
      const nuevaSesion = await login(
        datosUsuario.correo,
        datosUsuario.contrasena,
      );
      assert.equal(
        (
          await enviar(
            "/api/usuarios/" + usuarioId,
            { rol: "ADMIN" },
            user,
            "PATCH",
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await enviar(
            "/api/usuarios/" + usuarioId,
            { rol: "ADMIN" },
            admin,
            "PATCH",
          )
        ).status,
        200,
      );
      assert.equal(
        (await enviar("/api/libros/" + libroId, edicion, nuevaSesion, "PATCH"))
          .status,
        200,
      );
      assert.equal(
        (
          await enviar(
            "/api/usuarios/" + usuarioId,
            { rol: "USER" },
            nuevaSesion,
            "PATCH",
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await enviar(
            "/api/usuarios/" + usuarioId,
            { rol: "USER" },
            admin,
            "PATCH",
          )
        ).status,
        200,
      );
      assert.equal(
        (await enviar("/api/libros/" + libroId, edicion, nuevaSesion, "PATCH"))
          .status,
        403,
      );
      assert.equal(
        (await enviar("/api/libros/" + libroId, {}, admin, "DELETE")).status,
        200,
      );
      assert.equal(
        (
          await enviar(
            "/api/movimientos",
            { libroId, tipo: "ENTRADA", cantidad: 1 },
            user,
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await enviar(
            "/api/libros/" + libroId,
            { accion: "ACTIVAR" },
            admin,
            "PATCH",
          )
        ).status,
        200,
      );
      const fechaLimite = new Date(Date.now() + 7 * 86400000)
        .toISOString()
        .slice(0, 10);
      const prestamo = await enviar(
        "/api/prestamos",
        { libroId, cantidad: 2, fechaLimite },
        user,
      );
      assert.equal(prestamo.status, 201);
      const prestamoId = (await prestamo.json()).id;
      assert.equal(
        (await prisma.libros.findUniqueOrThrow({ where: { id: libroId } }))
          .existencias,
        1,
      );
      assert.equal(
        (await enviar("/api/libros/" + libroId, {}, admin, "DELETE")).status,
        409,
      );
      assert.equal(
        (await enviar("/api/prestamos/" + prestamoId, {}, nuevaSesion, "PATCH"))
          .status,
        403,
      );
      assert.equal(
        (await enviar("/api/prestamos/" + prestamoId, {}, user, "PATCH"))
          .status,
        200,
      );
      assert.equal(
        (await enviar("/api/prestamos/" + prestamoId, {}, user, "PATCH"))
          .status,
        409,
      );
      assert.equal(
        (await prisma.libros.findUniqueOrThrow({ where: { id: libroId } }))
          .existencias,
        3,
      );
      const reserva = await enviar(
        "/api/reservas",
        { libroId, cantidad: 2 },
        user,
      );
      assert.equal(reserva.status, 201);
      const reservaId = (await reserva.json()).id;
      assert.equal(
        (await prisma.libros.findUniqueOrThrow({ where: { id: libroId } }))
          .existencias,
        3,
      );
      assert.equal(
        (await enviar("/api/libros/" + libroId, {}, admin, "DELETE")).status,
        409,
      );
      assert.equal(
        (
          await enviar(
            "/api/reservas/" + reservaId,
            { accion: "ATENDER", fechaLimite },
            user,
            "PATCH",
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await enviar(
            "/api/reservas/" + reservaId,
            { accion: "ATENDER", fechaLimite },
            admin,
            "PATCH",
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await enviar(
            "/api/reservas/" + reservaId,
            { accion: "ATENDER", fechaLimite },
            admin,
            "PATCH",
          )
        ).status,
        409,
      );
      const atendida = await prisma.reservas.findUniqueOrThrow({
        where: { id: reservaId },
      });
      assert.ok(atendida.prestamoId);
      const devoluciones = await Promise.all([
        enviar("/api/prestamos/" + atendida.prestamoId, {}, user, "PATCH"),
        enviar("/api/prestamos/" + atendida.prestamoId, {}, user, "PATCH"),
      ]);
      assert.deepEqual(devoluciones.map((r) => r.status).sort(), [200, 409]);
      assert.equal(
        (await prisma.libros.findUniqueOrThrow({ where: { id: libroId } }))
          .existencias,
        3,
      );
      const sinStock = await enviar(
        "/api/reservas",
        { libroId, cantidad: 99 },
        user,
      );
      const sinStockId = (await sinStock.json()).id;
      assert.equal(
        (
          await enviar(
            "/api/reservas/" + sinStockId,
            { accion: "ATENDER", fechaLimite },
            admin,
            "PATCH",
          )
        ).status,
        409,
      );
      assert.equal(
        (await prisma.reservas.findUniqueOrThrow({ where: { id: sinStockId } }))
          .estado,
        "PENDIENTE",
      );
      assert.equal(
        (
          await enviar(
            "/api/reservas/" + sinStockId,
            { accion: "CANCELAR" },
            user,
            "PATCH",
          )
        ).status,
        200,
      );
      const anteriores = await prisma.movimientos.count({ where: { libroId } });
      const dobles = await Promise.all([
        enviar("/api/prestamos", { libroId, cantidad: 2, fechaLimite }, user),
        enviar("/api/prestamos", { libroId, cantidad: 2, fechaLimite }, user),
      ]);
      assert.deepEqual(dobles.map((r) => r.status).sort(), [201, 409]);
      assert.equal(
        (await prisma.libros.findUniqueOrThrow({ where: { id: libroId } }))
          .existencias,
        1,
      );
      assert.equal(
        await prisma.movimientos.count({ where: { libroId } }),
        anteriores + 1,
      );
      for (const ruta of [
        "/libros?q=" + marcador,
        "/libros?estado=inactivos",
        "/usuarios",
        "/prestamos",
        "/reservas",
      ]) {
        const respuesta = await fetch(base + ruta, {
          headers: { cookie: admin },
        });
        const html = await respuesta.text();
        assert.equal(respuesta.status, 200);
        assert.equal(html.includes("No pudimos cargar la información"), false);
      }
    } finally {
      if (libroId)
        await prisma.$transaction([
          prisma.reservas.deleteMany({ where: { libroId } }),
          prisma.movimientos.deleteMany({ where: { libroId } }),
          prisma.prestamos.deleteMany({ where: { libroId } }),
          prisma.libros.delete({ where: { id: libroId } }),
        ]);
      if (usuarioId) await prisma.usuarios.delete({ where: { id: usuarioId } });
      await prisma.$disconnect();
    }
  },
);
