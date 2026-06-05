import { clearAdminSessionCookie } from "@/lib/adminAuth";
import { apiSuccess } from "@/lib/apiResponse";

export async function POST() {
  const response = apiSuccess({ ok: true });
  return clearAdminSessionCookie(response);
}
