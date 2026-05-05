import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireLocalAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import {
  createBeneficioFlow,
  listBeneficiosByLocal,
} from "@/server/services/beneficiosApiService";

export async function GET(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const result = await listBeneficiosByLocal(session!.userId);
  return apiSuccess(result.data, result.status);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const body = await req.json();
  const result = await createBeneficioFlow(session!.userId, body);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  revalidatePath("/dashboard");
  if ((result.data as { esPublico?: boolean }).esPublico) {
    revalidatePath("/beneficios");
    revalidatePath("/");
  }
  return apiSuccess(result.data as Record<string, unknown>, result.status);
}
