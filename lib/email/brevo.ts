import "server-only";

export async function sendBrevoEmail({
  to,
  toName,
  subject,
  html,
}: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Engineer Bhai'r Dokan";

  if (!apiKey || !senderEmail) {
    return { success: false, error: "BREVO_API_KEY or BREVO_SENDER_EMAIL not configured" };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Brevo API error (${res.status}): ${body}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error sending email" };
  }
}
