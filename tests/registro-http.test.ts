import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { compare } from "bcryptjs";
import { prisma } from "../lib/prisma";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const enviar = (ruta: string, datos: object, cookie = "", origin = base) =>
  fetch(base + ruta, {
    method: "POST",
    headers: { origin, "content-type": "application/json", cookie },
    body: JSON.stringify(datos),
  });
test(
  "registro publico con rol USER, contraseña protegida y acceso posterior",
  { skip: process.env.RUN_HTTP_TESTS !== "1" },
  async () => {
    const correo = "registro." + crypto.randomUUID() + "@example.com";
    let id: string | undefined;
    const datos = {
      nombre: "Prueba",
      apellido: "Registro",
      correo,
      contrasena: "Prueba2026!",
      confirmacion: "Prueba2026!",
    };
    try {
      assert.equal(
        (await enviar("/api/registro", datos, "", "https://otro.example"))
          .status,
        403,
      );
      assert.equal(
        (await enviar("/api/registro", { ...datos, rol: "ADMIN" })).status,
        400,
      );
      assert.equal(await prisma.usuarios.count({ where: { correo } }), 0);
      assert.equal(
        (
          await enviar("/api/registro", {
            ...datos,
            confirmacion: "OtraClave2026!",
          })
        ).status,
        400,
      );
      assert.equal(
        (await enviar("/api/registro", { ...datos, correo: "invalido" }))
          .status,
        400,
      );
      assert.equal(
        (
          await enviar("/api/registro", {
            ...datos,
            contrasena: "corta",
            confirmacion: "corta",
          })
        ).status,
        400,
      );
      const creada = await enviar("/api/registro", {
        ...datos,
        correo: " " + correo.toUpperCase() + " ",
      });
      assert.equal(creada.status, 201);
      const resultado = await creada.json();
      assert.equal("contrasenaHash" in resultado, false);
      const usuario = await prisma.usuarios.findUniqueOrThrow({
        where: { correo },
      });
      id = usuario.id;
      assert.equal(usuario.rol, "USER");
      assert.ok(usuario.activo);
      assert.notEqual(usuario.contrasenaHash, datos.contrasena);
      assert.ok(await compare(datos.contrasena, usuario.contrasenaHash));
      assert.equal((await enviar("/api/registro", datos)).status, 409);
      const login = await enviar("/api/login", {
        correo,
        contrasena: datos.contrasena,
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get("set-cookie")!.split(";")[0];
      const inicio = await fetch(base + "/inicio", { headers: { cookie } });
      const html = await inicio.text();
      assert.equal(inicio.status, 200);
      assert.ok(html.includes("Prueba"));
      assert.equal(html.includes("NEXT_REDIRECT"), false);
      assert.equal((await enviar("/api/usuarios", {}, cookie)).status, 403);
      const pagina = await fetch(base + "/registro");
      const formulario = await pagina.text();
      assert.equal(pagina.status, 200);
      assert.ok(formulario.includes("Confirmar contraseña"));
      const final = await fetch(base + "/login?registro=exitoso");
      assert.ok((await final.text()).includes("Tu cuenta fue creada"));
    } finally {
      // Solo se elimina la cuenta aleatoria creada por esta prueba.
      if (!id)
        id = (
          await prisma.usuarios.findUnique({
            where: { correo },
            select: { id: true },
          })
        )?.id;
      if (id) await prisma.usuarios.delete({ where: { id } });
      await prisma.$disconnect();
    }
  },
);
