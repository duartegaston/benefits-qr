import { apiSuccess } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rubros = await prisma.rubro.findMany({ orderBy: { nombre: "asc" } });
  return apiSuccess(rubros);
}
