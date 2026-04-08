import {
  findLocalById,
  findReclamosByCliente,
  updateLocalLogo,
  updateLocalProfile,
} from "@/server/repositories/localApiRepository";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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
  input: { nombre?: unknown; direccion?: unknown; telefono?: unknown }
): Promise<{ ok: true; status: number; data: unknown } | ServiceError> {
  const { nombre, direccion, telefono } = input;

  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    return { ok: false, status: 400, error: "El nombre es requerido", code: "NOMBRE_REQUIRED" };
  }

  if (!telefono || typeof telefono !== "string" || telefono.trim() === "") {
    return { ok: false, status: 400, error: "El teléfono es requerido", code: "TELEFONO_REQUIRED" };
  }

  const local = await updateLocalProfile(localId, {
    nombre: nombre.trim(),
    direccion: typeof direccion === "string" ? direccion.trim() || null : null,
    telefono: telefono.trim() || null,
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

  if (file.size > 3 * 1024 * 1024) {
    return {
      ok: false,
      status: 400,
      error: "La imagen no puede superar 3MB",
      code: "FILE_TOO_LARGE",
    };
  }

  let logoUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const ext = file.name.split(".").pop() ?? "jpg";
    const blob = await put(`logos/${localId}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    logoUrl = blob.url;
  } else {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    logoUrl = `data:${file.type};base64,${base64}`;
  }

  await updateLocalLogo(localId, logoUrl);

  return { ok: true, status: 200, data: { url: logoUrl } };
}

export async function listMisBeneficiosByCliente(clienteId: string) {
  const reclamos = await findReclamosByCliente(clienteId);
  return { ok: true as const, status: 200, data: reclamos };
}
