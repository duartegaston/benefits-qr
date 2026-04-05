import { NextRequest } from "next/server";
import { requireClienteAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { generateReclamoQr } from "@/server/services/reclamoActionsService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireClienteAuth(req);
  if (error) return error;

  const { id } = await params;

  const result = await generateReclamoQr(id, session!.userId);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess({ qrDataURL: result.qrDataURL, expiresAt: result.expiresAt }, result.status);
}
