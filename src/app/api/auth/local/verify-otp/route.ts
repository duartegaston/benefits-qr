import { NextRequest } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { verifyLocalOtpFlow } from "@/server/services/authApiService";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await verifyLocalOtpFlow(body);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  const response = apiSuccess(result.data, result.status);
  setSessionCookie(response, result.sessionToken, result.userType);
  return response;
}
