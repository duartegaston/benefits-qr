import { NextRequest, NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  const token = req.cookies.get("local_session")?.value;
  if (session && token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }
  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
