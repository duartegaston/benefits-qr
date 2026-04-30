import { EstadoReclamo } from "@/generated/prisma/client";
import { getCurrentISODateInArgentina } from "@/lib/argentinaTime";
import {
  createBeneficio,
  findBeneficioOwnedByLocal,
  findBeneficioPublicById,
  findBeneficioStatsByLocal,
  findBeneficiosByLocal,
  softDeleteBeneficioAndCancelPending,
} from "@/server/repositories/beneficiosApiRepository";

type ServiceError = {
  ok: false;
  status: number;
  error: string;
  code: string;
};

export async function listBeneficiosByLocal(localId: string) {
  const beneficios = await findBeneficiosByLocal(localId);

  return {
    ok: true as const,
    status: 200,
    data: beneficios.map((b) => ({
      id: b.id,
      descripcion: b.descripcion,
      fechaExpiracion: b.fechaExpiracion,
      maxUsos: b.maxUsos,
      createdAt: b.createdAt,
      totalReclamos: b._count.reclamos,
      canjeados: b.reclamos.length,
    })),
  };
}

export async function createBeneficioFlow(
  localId: string,
  input: {
    descripcion?: unknown;
    fechaExpiracion?: unknown;
    maxUsos?: unknown;
    diasValidos?: unknown;
    esPublico?: unknown;
  }
): Promise<{ ok: true; status: number; data: unknown } | ServiceError> {
  const { descripcion, fechaExpiracion, maxUsos, diasValidos, esPublico } = input;

  if (typeof descripcion !== "string" || descripcion.trim().length === 0 || descripcion.length > 500) {
    return {
      ok: false,
      status: 400,
      error: "Descripción inválida (máx. 500 caracteres)",
      code: "INVALID_DESCRIPCION",
    };
  }

  if (!fechaExpiracion || typeof fechaExpiracion !== "string") {
    return {
      ok: false,
      status: 400,
      error: "Fecha de expiración requerida",
      code: "INVALID_FECHA_EXPIRACION",
    };
  }

  const expiryDate = new Date(`${fechaExpiracion}T23:59:59-03:00`);
  if (isNaN(expiryDate.getTime())) {
    return {
      ok: false,
      status: 400,
      error: "Fecha de expiración inválida",
      code: "INVALID_FECHA_EXPIRACION",
    };
  }

  const todayAR = getCurrentISODateInArgentina();
  if (fechaExpiracion < todayAR) {
    return {
      ok: false,
      status: 400,
      error: "La fecha de expiración no puede ser anterior a hoy",
      code: "PAST_FECHA_EXPIRACION",
    };
  }

  if (maxUsos !== undefined && maxUsos !== null) {
    if (typeof maxUsos !== "number" || !Number.isInteger(maxUsos) || maxUsos < 1) {
      return {
        ok: false,
        status: 400,
        error: "La cantidad máxima de usos debe ser un número entero positivo",
        code: "INVALID_MAX_USOS",
      };
    }
  }

  const dias: number[] = Array.isArray(diasValidos)
    ? diasValidos.filter((d: unknown) => typeof d === "number" && d >= 0 && d <= 6)
    : [];

  const beneficio = await createBeneficio({
    descripcion: descripcion.trim(),
    fechaExpiracion: expiryDate,
    maxUsos: (maxUsos as number | null) || null,
    diasValidos: dias,
    esPublico: esPublico === true,
    localId,
  });

  return { ok: true, status: 201, data: beneficio };
}

export async function getBeneficioById(
  id: string
): Promise<{ ok: true; status: number; data: unknown } | ServiceError> {
  const beneficio = await findBeneficioPublicById(id);

  if (!beneficio) {
    return { ok: false, status: 404, error: "Beneficio no encontrado", code: "BENEFICIO_NOT_FOUND" };
  }

  return { ok: true, status: 200, data: beneficio };
}

export async function deleteBeneficioFlow(
  id: string,
  localId: string
): Promise<{ ok: true; status: number } | ServiceError> {
  const beneficio = await findBeneficioOwnedByLocal(id, localId);

  if (!beneficio) {
    return { ok: false, status: 404, error: "Cupón no encontrado", code: "BENEFICIO_NOT_FOUND" };
  }

  await softDeleteBeneficioAndCancelPending(id);

  return { ok: true, status: 200 };
}

export async function getBeneficioStats(
  id: string,
  localId: string
): Promise<{ ok: true; status: number; data: unknown } | ServiceError> {
  const beneficio = await findBeneficioStatsByLocal(id, localId);

  if (!beneficio) {
    return { ok: false, status: 404, error: "Beneficio no encontrado", code: "BENEFICIO_NOT_FOUND" };
  }

  return {
    ok: true,
    status: 200,
    data: {
      ...beneficio,
      totalReclamos: beneficio.reclamos.length,
      canjeados: beneficio.reclamos.filter((r) => r.estado === EstadoReclamo.CANJEADO).length,
      pendientes: beneficio.reclamos.filter((r) => r.estado === EstadoReclamo.PENDIENTE).length,
    },
  };
}
