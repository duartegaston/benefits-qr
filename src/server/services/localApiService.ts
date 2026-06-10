import {
  findLocalById,
  findReclamosByCliente,
  updateLocalLogo,
  updateLocalProfile,
} from "@/server/repositories/localApiRepository";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_INPUT_LOGO_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_LOGO_BYTES = 200 * 1024;
const LOGO_DIMENSION_STEPS = [512, 448, 384, 320, 256, 192, 160, 128, 96];
const LOGO_QUALITY_STEPS = [82, 76, 70, 64, 58, 52, 46, 40, 34, 28];

async function optimizeLogoFile(file: File) {
  const sharp = (await import("sharp")).default;
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let lastCandidate: Buffer | null = null;

  for (const dimension of LOGO_DIMENSION_STEPS) {
    const resizedBuffer = await sharp(inputBuffer, { animated: false })
      .rotate()
      .resize(dimension, dimension, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    for (const quality of LOGO_QUALITY_STEPS) {
      const candidate = await sharp(resizedBuffer)
        .webp({ quality })
        .toBuffer();

      lastCandidate = candidate;

      if (candidate.byteLength <= MAX_OUTPUT_LOGO_BYTES) {
        return {
          buffer: candidate,
          contentType: "image/webp",
          extension: "webp",
        };
      }
    }
  }

  return {
    buffer: lastCandidate ?? inputBuffer,
    contentType: "image/webp",
    extension: "webp",
  };
}

type ServiceError = {
  ok: false;
  status: number;
  error: string;
  code: string;
};

export async function getLocalMeFlow(localId: string) {
  const local = await findLocalById(localId);
  if (!local) return { ok: false as const, status: 404, error: "Local no encontrado", code: "NOT_FOUND" };
  return { ok: true as const, status: 200, data: local };
}

export async function updateLocalMeFlow(
  localId: string,
  input: {
    nombre?: unknown;
    direccion?: unknown;
    lat?: unknown;
    lng?: unknown;
    placeId?: unknown;
    telefono?: unknown;
    rubroId?: unknown;
  }
): Promise<{ ok: true; status: number; data: unknown } | ServiceError> {
  const { nombre, direccion, lat, lng, placeId, telefono, rubroId } = input;

  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    return { ok: false, status: 400, error: "El nombre es requerido", code: "NOMBRE_REQUIRED" };
  }

  if (nombre.trim().length > 50) {
    return { ok: false, status: 400, error: "El nombre no puede superar 50 caracteres", code: "NOMBRE_TOO_LONG" };
  }

  if (!direccion || typeof direccion !== "string" || direccion.trim() === "") {
    return { ok: false, status: 400, error: "La dirección es requerida", code: "DIRECCION_REQUIRED" };
  }

  if (
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    typeof lng !== "number" ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return {
      ok: false,
      status: 400,
      error: "Seleccioná una dirección de las sugerencias",
      code: "DIRECCION_INVALIDA",
    };
  }

  if (!telefono || typeof telefono !== "string" || telefono.trim() === "") {
    return { ok: false, status: 400, error: "El teléfono es requerido", code: "TELEFONO_REQUIRED" };
  }

  if (!rubroId || typeof rubroId !== "number" || !Number.isInteger(rubroId) || rubroId <= 0) {
    return { ok: false, status: 400, error: "El rubro es requerido", code: "RUBRO_REQUIRED" };
  }

  const local = await updateLocalProfile(localId, {
    nombre: nombre.trim(),
    direccion: direccion.trim(),
    lat,
    lng,
    placeId: typeof placeId === "string" && placeId.trim() !== "" ? placeId.trim() : null,
    telefono: telefono.trim() || null,
    rubroId,
  });

  return { ok: true, status: 200, data: { ok: true, local } };
}

export async function uploadLogoFlow(
  localId: string,
  file: File | null
): Promise<{ ok: true; status: number; data: unknown } | ServiceError> {
  if (!file) {
    return { ok: false, status: 400, error: "Archivo requerido", code: "FILE_REQUIRED" };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      status: 400,
      error: "Solo se permiten imágenes JPG, PNG, WebP o GIF",
      code: "INVALID_FILE_TYPE",
    };
  }

  if (file.size > MAX_INPUT_LOGO_BYTES) {
    return {
      ok: false,
      status: 400,
      error: "La imagen no puede superar 10MB",
      code: "FILE_TOO_LARGE",
    };
  }

  let optimizedLogo: Awaited<ReturnType<typeof optimizeLogoFile>>;

  try {
    optimizedLogo = await optimizeLogoFile(file);
  } catch (error) {
    console.error("[upload-logo] Error al optimizar la imagen:", error);
    return {
      ok: false,
      status: 500,
      error: "No se pudo procesar la imagen. Probá nuevamente con otro archivo.",
      code: "IMAGE_PROCESSING_FAILED",
    };
  }

  if (optimizedLogo.buffer.byteLength > MAX_OUTPUT_LOGO_BYTES) {
    return {
      ok: false,
      status: 400,
      error: "No se pudo reducir la imagen a menos de 200KB. Probá con otra imagen.",
      code: "IMAGE_TOO_HEAVY_AFTER_OPTIMIZATION",
    };
  }

  let logoUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blobBody = new Uint8Array(optimizedLogo.buffer);
    const blob = await put(
      `logos/${localId}.${optimizedLogo.extension}`,
      new Blob([blobBody], { type: optimizedLogo.contentType }),
      {
        access: "public",
        addRandomSuffix: true,
      }
    );
    logoUrl = blob.url;
  } else {
    const base64 = optimizedLogo.buffer.toString("base64");
    logoUrl = `data:${optimizedLogo.contentType};base64,${base64}`;
  }

  await updateLocalLogo(localId, logoUrl);

  return { ok: true, status: 200, data: { url: logoUrl } };
}

export async function listMisBeneficiosByCliente(clienteId: string) {
  const reclamos = await findReclamosByCliente(clienteId);
  return { ok: true as const, status: 200, data: reclamos };
}
