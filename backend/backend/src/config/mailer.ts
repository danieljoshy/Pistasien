import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!smtpConfigured) {
    logger.info(`📧 [DEVELOPMENT EMAIL LOG] To: ${to} | Subject: ${subject}`);
    logger.info(`📧 [EMAIL CONTENT]:\n${html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.warn(`⚠️ Failed to send email via SMTP, falling back to console log. Error: ${(error as Error).message}`);
    logger.info(`📧 [DEVELOPMENT EMAIL FALLBACK LOG] To: ${to} | Subject: ${subject}`);
    logger.info(`📧 [EMAIL CONTENT]:\n${html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}`);
  }
};
