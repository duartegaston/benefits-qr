import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import { v4 as uuidv4 } from "uuid";

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
  userType: "LOCAL" | "CLIENTE",
  durationHours = SESSION_DURATION_DAYS * 24
) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: { token, userId, userType, expiresAt },
  });

  return session;
}

async function findSession(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return null;
  return session;
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
  userType: "LOCAL" | "CLIENTE"
) {
  const name = userType === "LOCAL" ? LOCAL_COOKIE : CLIENTE_COOKIE;
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
  if (!session || session.userType !== "LOCAL") {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function requireClienteAuth(req: NextRequest) {
  const session = await getClienteSession(req);
  if (!session || session.userType !== "CLIENTE") {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}
