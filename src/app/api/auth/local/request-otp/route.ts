import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requestLocalOtpFlow } from "@/server/services/authApiService";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await requestLocalOtpFlow(body);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess(result.data, result.status);
}
