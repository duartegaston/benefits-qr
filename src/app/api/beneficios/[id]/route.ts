import { NextRequest } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import {
  deleteBeneficioFlow,
  getBeneficioById,
} from "@/server/services/beneficiosApiService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await getBeneficioById(id);
  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess(result.data as Record<string, unknown>, result.status);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { id } = await params;

  const result = await deleteBeneficioFlow(id, session!.userId);
  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess({ success: true }, result.status);
}
