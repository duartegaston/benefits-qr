export async function sendOtpWhatsapp(to: string, code: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const accessToken = process.env.WHATSAPP_TOKEN!;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "qupon_magic_link";

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "es_AR" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }
}
