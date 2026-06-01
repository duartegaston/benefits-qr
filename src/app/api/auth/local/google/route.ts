import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  LOCAL_GOOGLE_CALLBACK_PATH,
  LOCAL_GOOGLE_OAUTH_STATE_COOKIE,
  buildPkceChallenge,
  buildGoogleAuthUrl,
  generatePkceVerifier,
  getGoogleRedirectUri,
  isGoogleOAuthConfigured,
} from "@/lib/googleOAuth";

export async function GET(req: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const nonce = randomUUID();
  const pkceVerifier = generatePkceVerifier();
  const codeChallenge = buildPkceChallenge(pkceVerifier);
  const authUrl = buildGoogleAuthUrl(
    nonce,
    getGoogleRedirectUri(LOCAL_GOOGLE_CALLBACK_PATH),
    codeChallenge
  );
  const response = NextResponse.redirect(authUrl);

  response.cookies.set(
    LOCAL_GOOGLE_OAUTH_STATE_COOKIE,
    JSON.stringify({ nonce, pkceVerifier }),
    {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
    }
  );

  return response;
}
