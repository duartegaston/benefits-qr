import { NextRequest } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { updateLocalMeFlow } from "@/server/services/localApiService";

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const body = await req.json();
  const result = await updateLocalMeFlow(session!.userId, body);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess(result.data, result.status);
}
