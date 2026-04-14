import { clearClienteSessionCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/apiResponse";

export async function POST() {
  const response = apiSuccess({ success: true });
  return clearClienteSessionCookie(response);
}
