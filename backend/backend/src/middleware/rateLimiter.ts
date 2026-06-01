import rateLimit from 'express-rate-limit';

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
// Applied to all routes: 100 requests per 15 minutes
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
});

// ─── Auth Rate Limiter ────────────────────────────────────────────────────────
// Strict: 10 attempts per 15 minutes on login/register/OTP routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts. Please wait 15 minutes before trying again.',
  },
});

// ─── OTP Rate Limiter ─────────────────────────────────────────────────────────
// Very strict: only 3 OTP sends per hour to prevent spam/abuse
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 1 hour.',
  },
});

// ─── Password Reset Rate Limiter ──────────────────────────────────────────────
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts. Try again in 1 hour.',
  },
});
