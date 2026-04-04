import { NextRequest } from "next/server";
import { clearClienteSessionCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/apiResponse";

export async function POST(_req: NextRequest) {
  const response = apiSuccess({ success: true });
  return clearClienteSessionCookie(response);
}
