// Se reduce en el navegador antes de subir: una foto de teléfono pesa varios
// MB y supera el límite de cuerpo de los Server Actions / funciones de Vercel.
// Se prueba de mayor a menor calidad y se usa la primera que entra en
// maxBytes: 0.92 ya es visualmente igual al original.
const JPEG_QUALITIES = [0.92, 0.88, 0.82, 0.75];

// Siempre se vuelve a codificar, aunque la foto ya sea liviana: así se borran
// los metadatos EXIF (la ubicación GPS de una foto de teléfono quedaría
// pública en R2).
export async function shrinkImage(file: File, maxSide: number, maxBytes: number) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d")!;
    // Fondo blanco: un PNG transparente pasado a JPEG quedaría negro.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    let blob: Blob | null = null;
    for (const quality of JPEG_QUALITIES) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob || blob.size <= maxBytes) break;
    }
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// Tope de la foto original que elige la administradora; lo que se sube ya
// reducido pesa mucho menos (el servidor valida el mismo tope).
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const IMAGE_TOO_LARGE = "La imagen no puede pesar más de 8MB.";
export const IMAGE_NOT_OPTIMIZED = "No pudimos optimizar esta foto. Prueba con otra.";

// Cubre la galería del producto en pantallas retina (50vw en escritorio,
// 100vw × 3 en iPhone) sin perder nitidez.
export const PRODUCT_PHOTO_MAX_SIDE = 2048;
// Lo que puede viajar en un solo envío: deja margen bajo el bodySizeLimit de
// 4MB (next.config.ts) para el resto de los campos.
export const PRODUCT_UPLOAD_BUDGET_BYTES = 3.5 * 1024 * 1024;
// Por foto al crear un producto: varias comparten el mismo envío.
export const PRODUCT_PHOTO_TARGET_BYTES = 1.2 * 1024 * 1024;
