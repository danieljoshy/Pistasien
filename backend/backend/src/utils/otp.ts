import crypto from 'crypto';
import { prisma } from '../config/db';
import { sendEmail } from '../config/mailer';
import { OTPType } from '@prisma/client';

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTP in DB (invalidates previous ones of same type)
export const createOTP = async (userId: string, type: OTPType): Promise<string> => {
  // Invalidate all existing OTPs of the same type for this user
  await prisma.oTP.updateMany({
    where: { userId, type, used: false },
    data: { used: true },
  });

  const code = generateOTP();
  const expiresAt = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 10) * 60 * 1000
  );

  await prisma.oTP.create({
    data: { userId, code, type, expiresAt },
  });

  return code;
};

// Verify OTP
export const verifyOTP = async (
  userId: string,
  code: string,
  type: OTPType
): Promise<boolean> => {
  const otp = await prisma.oTP.findFirst({
    where: {
      userId,
      code,
      type,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) return false;

  // Mark as used immediately (one-time use)
  await prisma.oTP.update({
    where: { id: otp.id },
    data: { used: true },
  });

  return true;
};

// Send OTP via email
export const sendOTPEmail = async (
  email: string,
  name: string,
  code: string,
  type: OTPType
) => {
  const subjects: Record<OTPType, string> = {
    EMAIL_VERIFY: 'Verify your Pistasien account',
    PASSWORD_RESET: 'Reset your Pistasien password',
    LOGIN: 'Your Pistasien login code',
  };

  const purposes: Record<OTPType, string> = {
    EMAIL_VERIFY: 'verify your email address',
    PASSWORD_RESET: 'reset your password',
    LOGIN: 'log in to your account',
  };

  await sendEmail({
    to: email,
    subject: subjects[type],
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Hi ${name || 'there'},</h2>
        <p>Use the code below to ${purposes[type]}:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                    text-align: center; padding: 20px; background: #f5f5f5; 
                    border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code expires in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.</p>
        <p style="color: #999; font-size: 12px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  });
};
