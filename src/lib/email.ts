import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "CONTENT <noreply@content.pl>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
    // Don't throw — email failure shouldn't break the main flow
  }
}
