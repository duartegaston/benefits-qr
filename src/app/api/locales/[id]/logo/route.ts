import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function shortHash(data: string | Buffer): string {
  return createHash("sha1").update(data).digest("hex").slice(0, 16);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const local = await prisma.local.findUnique({
    where: { id },
    select: { logoUrl: true },
  });

  if (!local?.logoUrl) {
    return new Response(null, { status: 404 });
  }

  const etag = `"${shortHash(local.logoUrl)}"`;

  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304 });
  }

  if (local.logoUrl.startsWith("data:")) {
    const match = local.logoUrl.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return new Response(null, { status: 400 });
    const [, mimeType, base64] = match;
    const buffer = Buffer.from(base64, "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, no-cache",
        "ETag": etag,
      },
    });
  }

  return NextResponse.redirect(local.logoUrl, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
