import { NextRequest } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getLocalLogoDisplayUrl } from "@/lib/localLogoSource";
import { uploadLogoFlow } from "@/server/services/localApiService";

export async function POST(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const form = await req.formData();
  const file = form.get("logo") as File | null;

  const result = await uploadLogoFlow(session!.userId, file);

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess(
    {
      ...result.data,
      displayUrl: getLocalLogoDisplayUrl({
        localId: session!.userId,
        logoUrl: result.data.url,
      }),
    },
    result.status
  );
}
