import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import { securityConfig } from '../config/security.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
const JWT_EXPIRES_IN = securityConfig.jwt.accessTokenExpiry;
const REFRESH_TOKEN_BYTES = securityConfig.jwt.refreshTokenBytes;

// Password hashing with salt (bcrypt automatically handles salt to prevent rainbow table attacks)
export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 12);
};

export const verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
};

// Generate OTP secret and token for TOTP (Time-based One-Time Password)
export const generateOTP = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const token = speakeasy.totp({ secret: secret.base32, encoding: 'base32' });
  return { secret: secret.base32, token };
};

// Verify OTP token
export const verifyOTP = (secret, token) => {
  try {
    return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: securityConfig.mfa.otpWindow });
  } catch (e) {
    return false;
  }
};

// Generate OTP for SMS/Email delivery (6-digit code)
export const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Biometric authentication support structure
export const BiometricAuth = {
  async registerBiometric(userId, credentialId, publicKey) {
    return {
      credentialId,
      registeredAt: new Date().toISOString(),
    };
  },

  async verifyBiometric(userId, credentialId, signature) {
    return true;
  },

  isAvailable() {
    return typeof navigator !== 'undefined' && navigator.credentials && navigator.credentials.create;
  },
};

export const passwordPolicyCheck = (password) => {
  const config = securityConfig.password;
  const minLen = config.minLength;
  const lower = /[a-z]/;
  const digit = /[0-9]/;
  const invalid = /[^a-z0-9]/; // Only allow lowercase letters and numbers

  if (typeof password !== 'string' || password.length < minLen) {
    return { ok: false, reason: `Password must be at least ${minLen} characters.` };
  }
  
  // Check for invalid characters (uppercase, special chars)
  if (invalid.test(password)) {
    return { ok: false, reason: 'Password can only contain lowercase letters and numbers.' };
  }
  
  if (config.requireLowercase && !lower.test(password)) {
    return { ok: false, reason: 'Password must include at least one lowercase letter.' };
  }
  if (config.requireDigit && !digit.test(password)) {
    return { ok: false, reason: 'Password must include at least one number.' };
  }

  return { ok: true };
};
