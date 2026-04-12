import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cache } from "react";
import { signToken, verifyToken } from "./jwt";
import { sendMagicLink } from "./email";
import { SESSION_DURATION } from "./constants";
import { prisma } from "./prisma";
import { UserType } from "./enums";

const LOCAL_COOKIE = "local_session";
const CLIENTE_COOKIE = "cliente_session";

const SESSION_DURATION_DAYS = 7;

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function createSession(
  userId: string,
  userType: UserType,
  durationHours = SESSION_DURATION_DAYS * 24
) {
  const token = await signToken({ userId, userType }, `${durationHours}h`);
  await prisma.session.create({
    data: {
      token,
      userId,
      userType,
      expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000),
    },
  });
  return { token };
}

async function findSession(token: string | undefined) {
  if (!token) return null;
  return verifyToken(token);
}

export async function getSession(req: NextRequest) {
  return findSession(req.cookies.get(LOCAL_COOKIE)?.value);
}

export async function getClienteSession(req: NextRequest) {
  return findSession(req.cookies.get(CLIENTE_COOKIE)?.value);
}

export const getSessionFromCookies = cache(async () => {
  const cookieStore = await cookies();
  return findSession(cookieStore.get(LOCAL_COOKIE)?.value);
});

export const getClienteSessionFromCookies = cache(async () => {
  const cookieStore = await cookies();
  return findSession(cookieStore.get(CLIENTE_COOKIE)?.value);
});

export function setSessionCookie(
  response: NextResponse,
  token: string,
  userType: UserType
) {
  const name = userType === UserType.LOCAL ? LOCAL_COOKIE : CLIENTE_COOKIE;
  response.cookies.set(name, token, {
    ...COOKIE_OPTS,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(LOCAL_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  return response;
}

export function clearClienteSessionCookie(response: NextResponse) {
  response.cookies.set(CLIENTE_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  return response;
}

export async function requireLocalAuth(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.userType !== UserType.LOCAL) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requireClienteAuth(req: NextRequest) {
  const session = await getClienteSession(req);
  if (!session || session.userType !== UserType.CLIENTE) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function createClienteSession(
  clienteId: string,
  email: string,
  durationHours: number = SESSION_DURATION.CLIENTE_RECLAMO
) {
  const session = await createSession(clienteId, UserType.CLIENTE, durationHours);
  await sendMagicLink(email, session.token);
  return session;
}
