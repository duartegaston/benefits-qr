import { NextRequest } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { canjearReclamo } from "@/server/services/reclamoActionsService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const { id } = await params;
  const { qrToken } = await req.json();

  const result = await canjearReclamo(id, qrToken, session!.userId);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess({ success: true }, result.status);
}
