import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import {
  CLIENTE_GOOGLE_CALLBACK_PATH,
  GOOGLE_OAUTH_STATE_COOKIE,
  exchangeGoogleCode,
  getGoogleRedirectUri,
} from "@/lib/googleOAuth";
import { loginClienteWithGoogle } from "@/server/services/googleAuthService";
import { ensureReclamoForCliente } from "@/server/services/reclamosService";

type OAuthState = {
  nonce: string;
  beneficioId: string | null;
  redirect: string;
};

function parseState(raw: string | undefined): OAuthState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OAuthState>;
    if (typeof parsed.nonce !== "string") return null;
    return {
      nonce: parsed.nonce,
      beneficioId: typeof parsed.beneficioId === "string" ? parsed.beneficioId : null,
      redirect:
        typeof parsed.redirect === "string" && parsed.redirect.startsWith("/")
          ? parsed.redirect
          : "/mis-beneficios",
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = parseState(req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value);

  const fail = (error: string) => {
    const res = NextResponse.redirect(new URL(`/acceso?error=${error}`, req.url));
    res.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  };

  if (!code || !state || !cookieState || state !== cookieState.nonce) {
    return fail("invalid");
  }

  try {
    const profile = await exchangeGoogleCode(code, getGoogleRedirectUri(CLIENTE_GOOGLE_CALLBACK_PATH));
    const result = await loginClienteWithGoogle(profile);

    if (!result.ok) {
      return fail("invalid");
    }

    if (cookieState.beneficioId) {
      await ensureReclamoForCliente(cookieState.beneficioId, result.clienteId);
    }

    const session = await createSession(result.clienteId, UserType.CLIENTE);

    const response = NextResponse.redirect(new URL(cookieState.redirect, req.url));
    setSessionCookie(response, session.token, UserType.CLIENTE);
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });

    return response;
  } catch (error) {
    console.error("[auth/cliente/google/callback]", error instanceof Error ? error.message : String(error));
    return fail("invalid");
  }
}
