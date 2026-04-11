import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
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

  if (local.logoUrl.startsWith("data:")) {
    const match = local.logoUrl.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) return new Response(null, { status: 400 });
    const [, mimeType, base64] = match;
    const buffer = Buffer.from(base64, "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return Response.redirect(local.logoUrl, 302);
}
