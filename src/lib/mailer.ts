import nodemailer, { type Transporter } from "nodemailer";
import { SITE_NAME } from "@/lib/site";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, ADMIN_NOTIFY_EMAIL } =
  process.env;

export const ADMIN_INBOX = ADMIN_NOTIFY_EMAIL || SMTP_USER || null;

export function isMailConfigured() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);
}

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const port = Number(SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      // Google muestra la contraseña de aplicación en grupos de 4 con espacios.
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD!.replace(/\s+/g, "") },
    });
  }
  return transporter;
}

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; path: string; cid: string }[];
};

// Nunca lanza: un correo que no sale no debe tumbar el registro, el checkout
// ni un cambio de estado que ya se guardó en la base.
export async function sendMail(message: MailMessage): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn(`sendMail: SMTP sin configurar, se omite "${message.subject}".`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: MAIL_FROM || `"${SITE_NAME}" <${SMTP_USER}>`,
      ...message,
    });
    return true;
  } catch (error) {
    console.error(`sendMail: falló "${message.subject}" a ${message.to}.`, error);
    return false;
  }
}
