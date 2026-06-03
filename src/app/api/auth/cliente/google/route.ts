import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  CLIENTE_GOOGLE_CALLBACK_PATH,
  GOOGLE_OAUTH_STATE_COOKIE,
  buildPkceChallenge,
  buildGoogleAuthUrl,
  generatePkceVerifier,
  getGoogleRedirectUri,
  isGoogleOAuthConfigured,
} from "@/lib/googleOAuth";
import { DIRECT_QR_FLOW } from "@/lib/flows";

const DEFAULT_REDIRECT = "/mis-beneficios";

function getSafeRedirect(value: string | null): string {
  if (!value) {
    return DEFAULT_REDIRECT;
  }

  if (value === "/mis-beneficios") {
    return value;
  }

  if (value.startsWith("/beneficio/")) {
    return value;
  }

  return DEFAULT_REDIRECT;
}

export async function GET(req: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/acceso?error=invalid", req.url));
  }

  const beneficioId = req.nextUrl.searchParams.get("beneficioId");
  const redirect = getSafeRedirect(req.nextUrl.searchParams.get("redirect"));
  const flow = req.nextUrl.searchParams.get("flow");
  const nonce = randomUUID();
  const pkceVerifier = generatePkceVerifier();
  const codeChallenge = buildPkceChallenge(pkceVerifier);

  const authUrl = buildGoogleAuthUrl(
    nonce,
    getGoogleRedirectUri(CLIENTE_GOOGLE_CALLBACK_PATH),
    codeChallenge
  );
  const response = NextResponse.redirect(authUrl);

  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    JSON.stringify({
      nonce,
      pkceVerifier,
      beneficioId: beneficioId ?? null,
      redirect,
      flow: flow === DIRECT_QR_FLOW ? DIRECT_QR_FLOW : null,
    }),
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
