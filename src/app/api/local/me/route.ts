import { NextRequest } from "next/server";
import { requireLocalAuth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getLocalMeFlow, updateLocalMeFlow } from "@/server/services/localApiService";

export async function GET(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const result = await getLocalMeFlow(session!.userId);
  if (!result.ok) return apiError(result.error, result.status, result.code);

  return apiSuccess(result.data, result.status);
}

export async function PATCH(req: NextRequest) {
  const { error, session } = await requireLocalAuth(req);
  if (error) return error;

  const contentType = req.headers.get("content-type") ?? "";

  const result = contentType.includes("multipart/form-data")
    ? await (async () => {
        const form = await req.formData();

        return updateLocalMeFlow(session!.userId, {
          nombre: form.get("nombre"),
          direccion: form.get("direccion"),
          lat: Number(form.get("lat")),
          lng: Number(form.get("lng")),
          placeId: form.get("placeId"),
          telefono: form.get("telefono"),
          rubroId: Number(form.get("rubroId")),
          logo: form.get("logo"),
        });
      })()
    : await updateLocalMeFlow(session!.userId, await req.json());

  if (!result.ok) {
    return apiError(result.error, result.status, result.code);
  }

  return apiSuccess(result.data, result.status);
}
