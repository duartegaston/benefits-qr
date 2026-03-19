import { NextRequest, NextResponse } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const form = await req.formData();
  const file = form.get("logo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede superar 2MB" }, { status: 400 });
  }

  let logoUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Producción: usar Vercel Blob
    const { put } = await import("@vercel/blob");
    const ext = file.name.split(".").pop() ?? "jpg";
    const blob = await put(`logos/${session!.userId}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    logoUrl = blob.url;
  } else {
    // Desarrollo: guardar como base64 (máx 500KB recomendado)
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    logoUrl = `data:${file.type};base64,${base64}`;
  }

  await prisma.local.update({
    where: { id: session!.userId },
    data: { logoUrl },
  });

  return NextResponse.json({ url: logoUrl });
}
