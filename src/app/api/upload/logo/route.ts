import { NextRequest } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { uploadLogoFlow } from "@/server/services/localApiService";

export async function POST(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const form = await req.formData();
  const file = form.get("logo") as File | null;

  const result = await uploadLogoFlow(session!.userId, file);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess(result.data, result.status);
}
