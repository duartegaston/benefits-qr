import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import { v4 as uuidv4 } from "uuid";

const COOKIE_NAME = "session_token";
const SESSION_DURATION_DAYS = 7;

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

export async function getSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export const getSessionFromCookies = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { token } });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
});

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: "/",
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
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
  const session = await getSession(req);
  if (!session || session.userType !== "CLIENTE") {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}
