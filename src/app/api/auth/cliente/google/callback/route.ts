import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import {
  CLIENTE_GOOGLE_CALLBACK_PATH,
  GOOGLE_OAUTH_STATE_COOKIE,
  exchangeGoogleCode,
  getGoogleRedirectUri,
} from "@/lib/googleOAuth";
import { DIRECT_QR_FLOW } from "@/lib/flows";
import { loginClienteWithGoogle } from "@/server/services/googleAuthService";
import {
  ensureReclamoForCliente,
  redeemBeneficioDirectForCliente,
} from "@/server/services/reclamosService";

type OAuthState = {
  nonce: string;
  pkceVerifier: string;
  beneficioId: string | null;
  redirect: string;
  flow: string | null;
};

function parseState(raw: string | undefined): OAuthState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OAuthState>;
    if (typeof parsed.nonce !== "string" || typeof parsed.pkceVerifier !== "string") {
      return null;
    }

    return {
      nonce: parsed.nonce,
      pkceVerifier: parsed.pkceVerifier,
      beneficioId: typeof parsed.beneficioId === "string" ? parsed.beneficioId : null,
      redirect:
        typeof parsed.redirect === "string" && parsed.redirect.startsWith("/")
          ? parsed.redirect
          : "/mis-beneficios",
      flow: parsed.flow === DIRECT_QR_FLOW ? DIRECT_QR_FLOW : null,
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
    const profile = await exchangeGoogleCode(
      code,
      getGoogleRedirectUri(CLIENTE_GOOGLE_CALLBACK_PATH),
      cookieState.pkceVerifier
    );
    const result = await loginClienteWithGoogle(profile);

    if (!result.ok) {
      return fail("invalid");
    }

    const session = await createSession(result.clienteId, UserType.CLIENTE);
    const redirectUrl = new URL(cookieState.redirect, req.url);

    if (cookieState.beneficioId && cookieState.flow === DIRECT_QR_FLOW) {
      const directRedeem = await redeemBeneficioDirectForCliente(
        cookieState.beneficioId,
        result.clienteId
      );

      if (!directRedeem.ok) {
        redirectUrl.searchParams.set("error", directRedeem.code);
      } else {
        redirectUrl.searchParams.set("redeemed", "1");
        redirectUrl.searchParams.set("order", directRedeem.orderNumber);
      }
    } else {
      if (cookieState.beneficioId) {
        await ensureReclamoForCliente(cookieState.beneficioId, result.clienteId);
      }

      if (result.isNew) {
        redirectUrl.searchParams.set("welcome", "1");
      }
    }

    const response = NextResponse.redirect(redirectUrl);
    setSessionCookie(response, session.token, UserType.CLIENTE);
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });

    return response;
  } catch (error) {
    console.error("[auth/cliente/google/callback]", error instanceof Error ? error.message : String(error));
    return fail("invalid");
  }
}
