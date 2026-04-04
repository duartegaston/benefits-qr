import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { sendClienteMagicLinkFlow } from "@/server/services/authApiService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await sendClienteMagicLinkFlow(body);

    if (!result.ok) {
      return apiError(result.error, result.status, result.code);
    }

    return apiSuccess(result.data, result.status);
  } catch (error) {
    console.error("[magic-link]", error instanceof Error ? error.message : String(error));
    return apiError("Error del servidor", 500, "INTERNAL_ERROR");
  }
}
