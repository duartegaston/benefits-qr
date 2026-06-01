import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  CLIENTE_GOOGLE_CALLBACK_PATH,
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthUrl,
  getGoogleRedirectUri,
  isGoogleOAuthConfigured,
} from "@/lib/googleOAuth";

function getSafeRedirect(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/mis-beneficios";
}

export async function GET(req: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/acceso?error=invalid", req.url));
  }

  const beneficioId = req.nextUrl.searchParams.get("beneficioId");
  const redirect = getSafeRedirect(req.nextUrl.searchParams.get("redirect"));
  const nonce = randomUUID();

  const authUrl = buildGoogleAuthUrl(nonce, getGoogleRedirectUri(CLIENTE_GOOGLE_CALLBACK_PATH));
  const response = NextResponse.redirect(authUrl);

  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    JSON.stringify({ nonce, beneficioId: beneficioId ?? null, redirect }),
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
