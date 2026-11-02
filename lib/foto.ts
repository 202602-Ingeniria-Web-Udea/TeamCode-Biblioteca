import sharp from "sharp";

export const prepararFoto = async (archivo: File) => {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(archivo.type) ||
    archivo.size === 0 ||
    archivo.size > 2 * 1024 * 1024
  )
    throw new Error("FOTO_INVALIDA");
  try {
    const imagen = await sharp(Buffer.from(await archivo.arrayBuffer()), {
      limitInputPixels: 16000000,
      animated: false,
    })
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();
    return "data:image/jpeg;base64," + imagen.toString("base64");
  } catch {
    throw new Error("FOTO_INVALIDA");
  }
};
