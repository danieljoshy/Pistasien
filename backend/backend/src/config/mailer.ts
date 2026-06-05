import sgMail from '@sendgrid/mail';
import { logger } from './logger';

const apiKey = process.env.SENDGRID_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

const sendgridConfigured = !!apiKey && !!emailFrom;

if (sendgridConfigured) {
  sgMail.setApiKey(apiKey);
  logger.info('📧 SendGrid Mail service initialized and ready.');
} else {
  logger.warn('⚠️ SendGrid is not configured. Missing SENDGRID_API_KEY or EMAIL_FROM.');
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!sendgridConfigured) {
    logger.info(`📧 [DEVELOPMENT EMAIL LOG] To: ${to} | Subject: ${subject}`);
    logger.info(`📧 [EMAIL CONTENT]:\n${html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    return;
  }

  try {
    await sgMail.send({
      to,
      from: emailFrom!,
      subject,
      html,
    });
    logger.info(`📧 Email sent successfully to ${to}`);
  } catch (error) {
    logger.warn(`⚠️ Failed to send email via SendGrid, falling back to console log. Error: ${(error as Error).message}`);
    logger.info(`📧 [DEVELOPMENT EMAIL FALLBACK LOG] To: ${to} | Subject: ${subject}`);
    logger.info(`📧 [EMAIL CONTENT]:\n${html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}`);
  }
};
