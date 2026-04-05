import { NextRequest } from "next/server";
import { requireClienteAuth } from "@/lib/auth";
import { apiSuccess } from "@/lib/apiResponse";
import { listMisBeneficiosByCliente } from "@/server/services/localApiService";

export async function GET(req: NextRequest) {
  const { error, session } = await requireClienteAuth(req);
  if (error) return error;

  const result = await listMisBeneficiosByCliente(session!.userId);
  return apiSuccess(result.data, result.status);
}
