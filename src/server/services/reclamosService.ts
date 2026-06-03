import { createSession } from "@/lib/auth";
import { SESSION_DURATION } from "@/lib/constants";
import { EstadoReclamo } from "@/generated/prisma/client";
import { evaluateBeneficioState, getCouponBlockError } from "@/lib/couponStatus";
import { UserType } from "@/lib/enums";
import {
  createClienteAnonimo,
  createReclamo,
  findBeneficioForReclamo,
  findClienteById,
  findExistingReclamo,
  findExistingReclamoPendiente,
  updateCliente,
} from "@/server/repositories/reclamosRepository";

function normalizeNombreCompleto(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length === 0 || normalized.length > 100) return null;

  return normalized;
}

function hasNombreCompleto(value: unknown): boolean {
  if (typeof value !== "string") return false;

  return value.trim().length > 0;
}

export async function ensureReclamoForCliente(
  beneficioId: string,
  clienteId: string
): Promise<void> {
  const beneficio = await findBeneficioForReclamo(beneficioId);
  if (!beneficio) return;

  const beneficioState = evaluateBeneficioState({
    fechaExpiracion: beneficio.fechaExpiracion,
    deletedAt: null,
    maxUsos: beneficio.maxUsos,
    canjeados: beneficio.reclamos.length,
    diasValidos: beneficio.diasValidos as number[],
  });

  if (!beneficioState.canClaim) return;

  const existingReclamo = await findExistingReclamo(beneficioId, clienteId);
  if (existingReclamo) return;

  await createReclamo(beneficioId, clienteId);
}

type CreateAnonymousReclamoResult =
  | { ok: true; status: number; reclamoId: string; sessionToken: string | null }
  | { ok: false; status: number; error: string; code: string };

type AnonymousNombreRequirementResult =
  | { ok: true; requiresNombre: boolean }
  | { ok: false; status: number; error: string; code: string };

export async function getAnonymousNombreRequirement(
  beneficioId: unknown,
  existingClienteId: string | null
): Promise<AnonymousNombreRequirementResult> {
  if (!beneficioId || typeof beneficioId !== "string") {
    return { ok: false, status: 400, error: "Cupón inválido", code: "INVALID_BENEFICIO_ID" };
  }

  const beneficio = await findBeneficioForReclamo(beneficioId);
  if (!beneficio) {
    return { ok: false, status: 404, error: "Cupón no encontrado", code: "BENEFICIO_NOT_FOUND" };
  }

  if (!existingClienteId) {
    return { ok: true, requiresNombre: true };
  }

  const cliente = await findClienteById(existingClienteId);
  return { ok: true, requiresNombre: !hasNombreCompleto(cliente?.nombre) };
}

export async function createAnonymousReclamoFlow(
  beneficioId: unknown,
  existingClienteId: string | null,
  nombre: unknown
): Promise<CreateAnonymousReclamoResult> {
  const normalizedNombre = normalizeNombreCompleto(nombre);

  if (!beneficioId || typeof beneficioId !== "string") {
    return { ok: false, status: 400, error: "Cupón inválido", code: "INVALID_BENEFICIO_ID" };
  }

  const beneficio = await findBeneficioForReclamo(beneficioId);

  if (!beneficio) {
    return { ok: false, status: 404, error: "Cupón no encontrado", code: "BENEFICIO_NOT_FOUND" };
  }

  const beneficioState = evaluateBeneficioState({
    fechaExpiracion: beneficio.fechaExpiracion,
    deletedAt: null,
    maxUsos: beneficio.maxUsos,
    canjeados: beneficio.reclamos.length,
    diasValidos: beneficio.diasValidos as number[],
  });

  if (!beneficioState.canClaim) {
    const error = getCouponBlockError(beneficioState.claimBlockReason, {
      diasValidos: beneficio.diasValidos as number[],
      context: "claim",
    });
    return { ok: false, status: error!.status, error: error!.error, code: error!.code };
  }

  if (existingClienteId) {
    const cliente = await findClienteById(existingClienteId);
    if (!cliente) {
      return { ok: false, status: 401, error: "Sesión inválida", code: "INVALID_SESSION" };
    }

    const needsNombre = !hasNombreCompleto(cliente.nombre);
    if (needsNombre && !normalizedNombre) {
      return {
        ok: false,
        status: 400,
        error: "Ingresá tu nombre para generar el QR",
        code: "NOMBRE_REQUIRED",
      };
    }

    if (needsNombre && normalizedNombre) {
      await updateCliente(existingClienteId, { nombre: normalizedNombre });
    }

    const existingReclamo = await findExistingReclamoPendiente(beneficioId, existingClienteId);
    if (existingReclamo) {
      return { ok: true, status: 200, reclamoId: existingReclamo.id, sessionToken: null };
    }

    const anyReclamo = await findExistingReclamo(beneficioId, existingClienteId);
    if (anyReclamo?.estado === EstadoReclamo.CANJEADO) {
      return {
        ok: false,
        status: 409,
        error: "Ya canjeaste este cupón",
        code: "RECLAMO_ALREADY_REDEEMED",
      };
    }

    const reclamo = await createReclamo(beneficioId, existingClienteId);
    return { ok: true, status: 201, reclamoId: reclamo.id, sessionToken: null };
  }

  if (!normalizedNombre) {
    return {
      ok: false,
      status: 400,
      error: "Ingresá tu nombre para generar el QR",
      code: "NOMBRE_REQUIRED",
    };
  }

  const cliente = await createClienteAnonimo({ nombre: normalizedNombre });
  const session = await createSession(cliente.id, UserType.CLIENTE, SESSION_DURATION.CLIENTE_RECLAMO);
  const reclamo = await createReclamo(beneficioId, cliente.id);

  return { ok: true, status: 201, reclamoId: reclamo.id, sessionToken: session.token };
}
