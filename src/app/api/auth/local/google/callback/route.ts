import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { UserType } from "@/lib/enums";
import {
  LOCAL_GOOGLE_CALLBACK_PATH,
  LOCAL_GOOGLE_OAUTH_STATE_COOKIE,
  exchangeGoogleCode,
  getGoogleRedirectUri,
} from "@/lib/googleOAuth";
import { loginLocalWithGoogle } from "@/server/services/authApiService";

type OAuthState = {
  nonce: string;
  pkceVerifier: string;
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
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = parseState(req.cookies.get(LOCAL_GOOGLE_OAUTH_STATE_COOKIE)?.value);

  const redirectTo = (path: string) => {
    const res = NextResponse.redirect(new URL(path, req.url));
    res.cookies.set(LOCAL_GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  };

  if (!code || !state || !cookieState || state !== cookieState.nonce) {
    return redirectTo("/login?error=invalid");
  }

  try {
    const profile = await exchangeGoogleCode(
      code,
      getGoogleRedirectUri(LOCAL_GOOGLE_CALLBACK_PATH),
      cookieState.pkceVerifier
    );
    const result = await loginLocalWithGoogle(profile);

    if (!result.ok) {
      if (result.reason === "pending_approval") {
        return redirectTo("/login?status=pending");
      }
      return redirectTo("/login?error=invalid");
    }

    const session = await createSession(result.localId, UserType.LOCAL);

    const response = redirectTo(result.redirect);
    setSessionCookie(response, session.token, UserType.LOCAL);

    return response;
  } catch (error) {
    console.error("[auth/local/google/callback]", error instanceof Error ? error.message : String(error));
    return redirectTo("/login?error=invalid");
  }
}
