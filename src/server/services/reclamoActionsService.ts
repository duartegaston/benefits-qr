import { v4 as uuidv4 } from "uuid";
import { QR_EXPIRY_MINUTES } from "@/lib/constants";
import { buildQRPayload, generateQRDataURL } from "@/lib/qr";
import { EstadoReclamo } from "@/generated/prisma/client";
import {
  findReclamoForCanje,
  findReclamoForQr,
  markReclamoAsCanjeado,
  setQrToken,
} from "@/server/repositories/reclamoActionsRepository";

type ServiceError = {
  ok: false;
  status: number;
  error: string;
  code: string;
};

type QrResult =
  | {
      ok: true;
      status: number;
      qrDataURL: string;
      expiresAt: Date;
    }
  | ServiceError;

type CanjeResult =
  | {
      ok: true;
      status: number;
    }
  | ServiceError;

export async function generateReclamoQr(
  reclamoId: string,
  clienteId: string
): Promise<QrResult> {
  const reclamo = await findReclamoForQr(reclamoId, clienteId);

  if (!reclamo) {
    return { ok: false, status: 404, error: "Reclamo no encontrado", code: "RECLAMO_NOT_FOUND" };
  }

  if (reclamo.estado === EstadoReclamo.CANJEADO) {
    return {
      ok: false,
      status: 400,
      error: "Este cupón ya fue canjeado",
      code: "RECLAMO_ALREADY_REDEEMED",
    };
  }

  if (reclamo.estado === EstadoReclamo.CANCELADO) {
    return {
      ok: false,
      status: 409,
      error: "Este cupón ha sido eliminado por el local",
      code: "RECLAMO_CANCELLED",
    };
  }

  const qrToken = uuidv4();
  const qrTokenExpira = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000);

  await setQrToken(reclamoId, qrToken, qrTokenExpira);

  const payload = buildQRPayload(reclamoId, qrToken);
  const qrDataURL = await generateQRDataURL(payload);

  return { ok: true, status: 200, qrDataURL, expiresAt: qrTokenExpira };
}

export async function canjearReclamo(
  reclamoId: string,
  qrToken: unknown,
  localId: string
): Promise<CanjeResult> {
  if (typeof qrToken !== "string" || qrToken.length === 0) {
    return { ok: false, status: 400, error: "Token QR requerido", code: "QR_TOKEN_REQUIRED" };
  }

  const reclamo = await findReclamoForCanje(reclamoId, qrToken);

  if (!reclamo) {
    return { ok: false, status: 400, error: "QR inválido", code: "QR_INVALID" };
  }

  if (reclamo.beneficio.localId !== localId) {
    return { ok: false, status: 403, error: "No autorizado", code: "FORBIDDEN" };
  }

  if (!reclamo.qrTokenExpira || reclamo.qrTokenExpira < new Date()) {
    return { ok: false, status: 400, error: "QR expirado", code: "QR_EXPIRED" };
  }

  if (reclamo.beneficio.deletedAt !== null) {
    return {
      ok: false,
      status: 400,
      error: "Este beneficio ya no está disponible",
      code: "BENEFICIO_UNAVAILABLE",
    };
  }

  if (reclamo.estado === EstadoReclamo.CANCELADO) {
    return {
      ok: false,
      status: 409,
      error: "Este cupón ha sido eliminado por el local",
      code: "RECLAMO_CANCELLED",
    };
  }

  if (reclamo.estado === EstadoReclamo.CANJEADO) {
    return {
      ok: false,
      status: 400,
      error: "Este cupón ya fue canjeado",
      code: "RECLAMO_ALREADY_REDEEMED",
    };
  }

  await markReclamoAsCanjeado(reclamoId);

  return { ok: true, status: 200 };
}
