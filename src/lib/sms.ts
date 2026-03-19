import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendMagicLinkSms(to: string, token: string, redirect: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/api/auth/cliente/verify?token=${token}&redirect=${encodeURIComponent(redirect)}`;
  await client.messages.create({
    body: `Qupón: Ingresá a tus beneficios con este enlace (expira en 24h): ${magicLink}`,
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
  });
}
