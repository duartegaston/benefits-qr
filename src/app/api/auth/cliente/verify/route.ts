import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { verifyClienteMagicLinkFlow } from "@/server/services/authApiService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const result = await verifyClienteMagicLinkFlow(token, searchParams.get("redirect"));

  const response = NextResponse.redirect(new URL(result.redirectTo, req.url));
  if (!result.ok) {
    return response;
  }

  return setSessionCookie(response, result.sessionToken, result.userType);
}
