import type { GoogleProfile } from "@/lib/googleOAuth";
import {
  createClienteWithGoogle,
  findClienteByEmail,
  findClienteByGoogleId,
  updateCliente,
} from "@/server/repositories/reclamosRepository";

type LoginClienteWithGoogleResult =
  | { ok: true; clienteId: string; isNew: boolean }
  | { ok: false; error: string };

export async function loginClienteWithGoogle(
  profile: GoogleProfile
): Promise<LoginClienteWithGoogleResult> {
  if (!profile.emailVerified) {
    return { ok: false, error: "email_unverified" };
  }

  const byGoogleId = await findClienteByGoogleId(profile.googleId);
  if (byGoogleId) {
    if (!byGoogleId.nombre && profile.nombre) {
      await updateCliente(byGoogleId.id, { nombre: profile.nombre });
    }
    return { ok: true, clienteId: byGoogleId.id, isNew: false };
  }

  const byEmail = await findClienteByEmail(profile.email);
  if (byEmail) {
    const updates: Partial<{ nombre: string; googleId: string }> = {
      googleId: profile.googleId,
    };
    if (!byEmail.nombre && profile.nombre) {
      updates.nombre = profile.nombre;
    }
    await updateCliente(byEmail.id, updates);
    return { ok: true, clienteId: byEmail.id, isNew: false };
  }

  const cliente = await createClienteWithGoogle({
    email: profile.email,
    googleId: profile.googleId,
    nombre: profile.nombre,
  });

  return { ok: true, clienteId: cliente.id, isNew: true };
}
