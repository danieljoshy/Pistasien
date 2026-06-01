import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/db';
import { protect, AuthRequest } from '../middleware/auth';
import { authRateLimiter, otpRateLimiter, passwordResetLimiter } from '../middleware/rateLimiter';
import { createOTP, verifyOTP, sendOTPEmail } from '../utils/otp';
import { AppError } from '../middleware/errorHandler';
import { OTPType } from '@prisma/client';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    // Send email verification OTP
    const otp = await createOTP(user.id, OTPType.EMAIL_VERIFY);
    await sendOTPEmail(email, name, otp, OTPType.EMAIL_VERIFY);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification OTP.',
      userId: user.id,
    });
  }
);

// ─── POST /api/auth/verify-email ──────────────────────────────────────────────
router.post('/verify-email',
  authRateLimiter,
  [
    body('userId').notEmpty(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId, otp } = req.body;
    const valid = await verifyOTP(userId, otp, OTPType.EMAIL_VERIFY);

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    setCookies(res, accessToken, refreshToken);

    res.json({ success: true, message: 'Email verified! You are now logged in.' });
  }
);

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
router.post('/resend-otp',
  otpRateLimiter,
  [body('userId').notEmpty()],
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Already verified.' });

    const otp = await createOTP(user.id, OTPType.EMAIL_VERIFY);
    await sendOTPEmail(user.email, user.name || '', otp, OTPType.EMAIL_VERIFY);

    res.json({ success: true, message: 'OTP resent. Check your email.' });
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Generic error message — don't reveal if email exists
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        userId: user.id,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    setCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Login successful.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }
);

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password',
  passwordResetLimiter,
  [body('email').isEmail().normalizeEmail()],
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = await createOTP(user.id, OTPType.PASSWORD_RESET);
    await sendOTPEmail(email, user.name || '', otp, OTPType.PASSWORD_RESET);

    res.json({ success: true, message: 'If that email exists, an OTP has been sent.', userId: user.id });
  }
);

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password',
  authRateLimiter,
  [
    body('userId').notEmpty(),
    body('otp').isLength({ min: 6, max: 6 }),
    body('newPassword').isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId, otp, newPassword } = req.body;
    const valid = await verifyOTP(userId, otp, OTPType.PASSWORD_RESET);

    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  }
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    setCookies(res, accessToken, refreshToken);

    res.json({ success: true });
  } catch {
    res.status(401).json({ success: false, message: 'Refresh token expired. Please log in again.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', protect, async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { refreshToken: null },
  });
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
