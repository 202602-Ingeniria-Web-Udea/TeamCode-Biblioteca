import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";

test(
  "foto propia: autenticación, validación, persistencia y eliminación",
  { skip: process.env.RUN_HTTP_TESTS !== "1" },
  async () => {
    const usuario = await prisma.usuarios.create({
      data: {
        nombre: "Foto",
        apellido: "Prueba",
        correo: "foto." + crypto.randomUUID() + "@example.com",
        contrasenaHash: await hash("Prueba2026!", 12),
      },
    });
    try {
      const imagen = await sharp({
        create: { width: 400, height: 300, channels: 3, background: "#abcdef" },
      })
        .png()
        .toBuffer();
      const datos = (bytes: Uint8Array, tipo = "image/png") => {
        const form = new FormData();
        form.set(
          "foto",
          new Blob([new Uint8Array(bytes)], { type: tipo }),
          "foto.png",
        );
        return form;
      };
      const subir = (body: FormData, cookie = "", origin = base) =>
        fetch(base + "/api/perfil/foto", {
          method: "POST",
          headers: { cookie, origin },
          body,
        });
      assert.equal((await subir(datos(imagen))).status, 401);
      const login = await fetch(base + "/api/login", {
        method: "POST",
        headers: { origin: base, "content-type": "application/json" },
        body: JSON.stringify({
          correo: usuario.correo,
          contrasena: "Prueba2026!",
        }),
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get("set-cookie")!.split(";")[0];
      assert.equal(
        (await subir(datos(imagen), cookie, "https://otro.example")).status,
        403,
      );
      assert.equal(
        (await subir(datos(Buffer.from("<svg/>"), "image/svg+xml"), cookie))
          .status,
        400,
      );
      assert.equal(
        (await subir(datos(Buffer.from("imagen falsa")), cookie)).status,
        400,
      );
      assert.ok(
        [400, 413].includes(
          (await subir(datos(new Uint8Array(2 * 1024 * 1024 + 1)), cookie))
            .status,
        ),
      );
      assert.equal((await subir(datos(imagen), cookie)).status, 200);
      const guardado = await prisma.usuarios.findUniqueOrThrow({
        where: { id: usuario.id },
      });
      assert.ok(guardado.foto?.startsWith("data:image/jpeg;base64,"));
      const meta = await sharp(
        Buffer.from(guardado.foto!.split(",")[1], "base64"),
      ).metadata();
      assert.equal(meta.width, 256);
      assert.equal(meta.height, 256);
      const pagina = await fetch(base + "/inicio", { headers: { cookie } });
      assert.ok((await pagina.text()).includes("Foto de Foto"));
      assert.equal(
        (
          await fetch(base + "/api/perfil/foto", {
            method: "DELETE",
            headers: { origin: base, cookie },
          })
        ).status,
        200,
      );
      assert.equal(
        (await prisma.usuarios.findUniqueOrThrow({ where: { id: usuario.id } }))
          .foto,
        null,
      );
    } finally {
      await prisma.usuarios.delete({ where: { id: usuario.id } });
      await prisma.$disconnect();
    }
  },
);
