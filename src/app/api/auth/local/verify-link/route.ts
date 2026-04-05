import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { verifyLocalMagicLinkFlow } from "@/server/services/authApiService";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  const result = await verifyLocalMagicLinkFlow(token);

  const response = NextResponse.redirect(new URL(result.redirectTo, req.url));
  if (!result.ok) {
    return response;
  }

  return setSessionCookie(response, result.sessionToken, result.userType);
}
