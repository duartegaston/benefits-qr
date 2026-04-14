import { createClienteSession } from "@/lib/auth";
import { EMAIL_REGEX, PHONE_REGEX, SESSION_DURATION } from "@/lib/constants";
import { EstadoReclamo } from "@/generated/prisma/client";
import { evaluateBeneficioState, getCouponBlockError } from "@/lib/couponStatus";
import {
  createCliente,
  createReclamo,
  findBeneficioForReclamo,
  findClienteByEmail,
  findClienteByPhone,
  findExistingReclamo,
  updateCliente,
} from "@/server/repositories/reclamosRepository";

type CreateReclamoInput = {
  beneficioId: unknown;
  nombre: unknown;
  email: unknown;
  phone: unknown;
};

type CreateReclamoResult =
  | { ok: true; status: number; reclamoId: string }
  | { ok: false; status: number; error: string; code: string };

export async function createReclamoFlow(input: CreateReclamoInput): Promise<CreateReclamoResult> {
  const { beneficioId, nombre, email, phone } = input;

  if (!beneficioId || !nombre || !email || !phone) {
    return {
      ok: false,
      status: 400,
      error: "Nombre, email y teléfono son requeridos",
      code: "INVALID_INPUT",
    };
  }

  if (typeof beneficioId !== "string") {
    return { ok: false, status: 400, error: "Cupón inválido", code: "INVALID_BENEFICIO_ID" };
  }

  if (typeof nombre !== "string" || nombre.trim().length === 0 || nombre.length > 100) {
    return {
      ok: false,
      status: 400,
      error: "Nombre inválido (máx. 100 caracteres)",
      code: "INVALID_NOMBRE",
    };
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
    return { ok: false, status: 400, error: "Email inválido", code: "INVALID_EMAIL" };
  }

  if (typeof phone !== "string" || !PHONE_REGEX.test(phone)) {
    return {
      ok: false,
      status: 400,
      error: "Número de teléfono inválido",
      code: "INVALID_PHONE",
    };
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

    return {
      ok: false,
      status: error!.status,
      error: error!.error,
      code: error!.code,
    };
  }

  const [clienteByEmail, clienteByPhone] = await Promise.all([
    findClienteByEmail(email),
    findClienteByPhone(phone),
  ]);

  if (clienteByEmail && clienteByEmail.phone && clienteByEmail.phone !== phone) {
    return {
      ok: false,
      status: 400,
      error: "Este email ya está registrado con otro número de teléfono",
      code: "EMAIL_PHONE_CONFLICT",
    };
  }

  if (clienteByPhone && clienteByPhone.email && clienteByPhone.email !== email) {
    return {
      ok: false,
      status: 400,
      error: "Este número de teléfono ya está registrado con otro email",
      code: "PHONE_EMAIL_CONFLICT",
    };
  }

  if (clienteByEmail && clienteByPhone && clienteByEmail.id !== clienteByPhone.id) {
    return {
      ok: false,
      status: 400,
      error: "El email y el teléfono ya están registrados en cuentas separadas. Contactate con el negocio.",
      code: "SPLIT_IDENTITY_CONFLICT",
    };
  }

  let cliente = clienteByEmail ?? clienteByPhone;
  if (!cliente) {
    cliente = await createCliente({ nombre, email, phone });
  } else {
    const updates: Partial<{ nombre: string; email: string; phone: string }> = {};
    if (!cliente.nombre) updates.nombre = nombre;
    if (!cliente.email) updates.email = email;
    if (!cliente.phone) updates.phone = phone;
    if (Object.keys(updates).length > 0) {
      cliente = await updateCliente(cliente.id, updates);
    }
  }

  const existingReclamo = await findExistingReclamo(beneficioId, cliente.id);

  if (existingReclamo) {
    if (existingReclamo.estado === EstadoReclamo.CANJEADO) {
      return { ok: false, status: 409, error: "Ya canjeaste este cupón", code: "RECLAMO_ALREADY_REDEEMED" };
    }

    await createClienteSession(cliente.id, email, SESSION_DURATION.CLIENTE_RECLAMO);
    return { ok: true, status: 200, reclamoId: existingReclamo.id };
  }

  const reclamo = await createReclamo(beneficioId, cliente.id);

  await createClienteSession(cliente.id, email, SESSION_DURATION.CLIENTE_RECLAMO);

  return { ok: true, status: 201, reclamoId: reclamo.id };
}
