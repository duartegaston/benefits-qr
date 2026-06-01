import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/acceso?error=invalid", req.url));
  }

  return NextResponse.redirect(
    new URL(`/acceso?token=${encodeURIComponent(token)}`, req.url)
  );
}
