import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  passwordPolicyCheck,
} from '../utils/auth.js';
import { MFAService } from '../services/mfa.js';
import { alertingService, AlertType, AlertSeverity } from '../services/alert.js';
import { securityConfig } from '../config/security.js';
import { Role } from '../utils/constants.js';
import crypto from 'crypto';

export class AuthController {
  constructor() {
    this.verificationCodes = new Map();
  }

  async login(username, password, ip = '127.0.0.1', userAgent = '', location = null, device = null) {
    const db = getDb();
    const user = await db.collection('users').findOne({ username });
    
    if (!user) {
      await createLogEntry(null, username, 'LOGIN_FAILED', 'User not found', 'DENIED', ip);
      throw new Error('User not found');
    }

    if (user.lockedUntil && Date.now() < user.lockedUntil) {
      alertingService.alertAccountLocked(user._id, user.username, 'Account already locked');
      throw new Error(`Account locked. Try again later`);
    }

    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) {
      const failedAttempts = (user.failedAttempts || 0) + 1;
      const update = { failedAttempts };
      
      if (failedAttempts >= securityConfig.accountLockout.maxAttempts) {
        update.lockedUntil = Date.now() + securityConfig.accountLockout.lockoutDuration;
        await createLogEntry(user._id, user.username, 'LOGIN_FAILED', 'Account locked due to repeated failed attempts', 'DENIED', ip);
        alertingService.alertAccountLocked(user._id, user.username, 'Brute force protection triggered');
        alertingService.createAlert(AlertType.ACCOUNT_LOCKED, AlertSeverity.HIGH, `Account locked: ${username}`, { reason: 'Failed login attempts', ip }, user._id, user.username);
        await db.collection('users').updateOne({ _id: user._id }, { $set: update });
        throw new Error('Account locked due to repeated failed attempts');
      }
      
      await db.collection('users').updateOne({ _id: user._id }, { $set: update });
      await createLogEntry(user._id, user.username, 'LOGIN_FAILED', 'Invalid password', 'DENIED', ip);
      throw new Error('Invalid credentials');
    }

    await db.collection('users').updateOne({ _id: user._id }, { $set: { failedAttempts: 0, lockedUntil: null } });

    // MFA is now MANDATORY for all users via email
    if (!user.email) {
      throw new Error('Email is required for authentication. Please contact administrator.');
    }

    // Generate OTP code and send via email (MANDATORY MFA)
    const mfaCode = MFAService.generateSMSOTP();
    const pendingOtp = { 
      code: mfaCode, 
      createdAt: Date.now(),
      expiresAt: Date.now() + securityConfig.mfa.codeExpiry 
    };
    
    // Send MFA code to user's email
    try {
      await MFAService.sendMFACodeToEmail(user.email, user.username, mfaCode);
      console.log(`[Login] ✅ MFA code sent to ${user.email} for user ${user.username}`);
    } catch (emailError) {
      console.error('[Login] Failed to send MFA email:', emailError.message);
      throw new Error(`Failed to send verification code: ${emailError.message || 'Please check email configuration or try again later.'}`);
    }
    
    await db.collection('users').updateOne({ _id: user._id }, { $set: { pendingOtp, mfaEnabled: true } });
    await createLogEntry(user._id, user.username, 'LOGIN_MFA_REQUIRED', 'MFA code sent to email (mandatory)', 'PENDING', ip);
    return { mfaRequired: true, message: 'Verification code sent to your email. Please check your inbox.' };
  }

  async verifyOtp(username, token, biometricData = null, ip = '127.0.0.1', userAgent = '') {
    const db = getDb();
    const user = await db.collection('users').findOne({ username });
    if (!user || !user.pendingOtp) throw new Error('No pending MFA verification. Please login again.');
    
    let verified = false;
    
    if (biometricData && user.biometricEnabled) {
      verified = await MFAService.verifyBiometric(user._id, biometricData.credentialId, biometricData.signature);
      if (!verified) {
        await createLogEntry(user._id, user.username, 'MFA_BIOMETRIC_FAILED', 'Invalid biometric', 'DENIED', ip);
        throw new Error('Biometric verification failed');
      }
    } else {
      // Check if code expired
      if (user.pendingOtp.expiresAt && Date.now() > user.pendingOtp.expiresAt) {
        await createLogEntry(user._id, user.username, 'MFA_FAILED', 'MFA code expired', 'DENIED', ip);
        throw new Error('Verification code has expired. Please login again to receive a new code.');
      }
      
      // Verify email OTP code
      const expectedCode = user.pendingOtp.code || user.pendingOtp.token;
      verified = token === expectedCode;
      
      if (!verified) {
        await createLogEntry(user._id, user.username, 'MFA_FAILED', 'Invalid MFA code', 'DENIED', ip);
        throw new Error('Invalid verification code. Please check your email and try again.');
      }
    }
    
    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken();
    
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session = {
      sessionId,
      userId: user._id,
      username: user.username,
      ip,
      userAgent,
      location: null,
      device: null,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + securityConfig.session.maxAge),
    };

    await db.collection('users').updateOne({ _id: user._id }, { $set: { refreshToken, pendingOtp: null } });
    await db.collection('sessions').insertOne(session);
    await createLogEntry(user._id, user.username, 'MFA_SUCCESS', biometricData ? 'Biometric MFA verified' : 'Email MFA verified', 'SUCCESS', ip);
    
    const safeUser = { 
      _id: user._id, 
      username: user.username, 
      role: user.role, 
      department: user.department, 
      clearanceLevel: user.clearanceLevel, 
      mfaEnabled: true,
      email: user.email,
      phone: user.phone,
      profile: user.profile || {},
    };
    return { user: safeUser, accessToken, refreshToken, sessionId };
  }

  async refreshAccess(refreshToken) {
    const db = getDb();
    const user = await db.collection('users').findOne({ refreshToken });
    if (!user) throw new Error('Invalid refresh token');
    
    const accessToken = generateAccessToken({ userId: user._id, role: user.role });
    await createLogEntry(user._id, user.username, 'TOKEN_REFRESH', 'Access token refreshed');
    return { accessToken };
  }

  async register({ username, password, email, phone, role = Role.STAFF, department = 'All', mfaEnabled = false, captchaToken = null }) {
    const db = getDb();
    
    if (!captchaToken) {
      throw new Error('CAPTCHA verification required');
    }

    // Email is now required
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }

    const existingUser = await db.collection('users').findOne({ 
      $or: [
        { username },
        { email },
        ...(phone ? [{ phone }] : [])
      ]
    });
    
    if (existingUser) {
      if (existingUser.username === username) throw new Error('Username already exists');
      if (existingUser.email === email) throw new Error('Email already registered');
      if (phone && existingUser.phone === phone) throw new Error('Phone already registered');
    }

    const check = password ? passwordPolicyCheck(password) : { ok: false, reason: 'Password required' };
    if (!check.ok) throw new Error(check.reason);

    const passwordHash = hashPassword(password);
    const emailVerificationCode = MFAService.generateSMSOTP();
    const phoneVerificationCode = phone ? MFAService.generateSMSOTP() : null;
    
    // Send verification code to email
    try {
      await MFAService.sendEmailCode(email, username, emailVerificationCode, 'Email Verification');
      console.log(`[Register] ✅ Verification email sent to ${email} for user ${username}`);
    } catch (emailError) {
      console.error('[Register] Failed to send verification email:', emailError.message);
      throw new Error(`Failed to send verification email: ${emailError.message || 'Please check SMTP configuration'}`);
    }
    
    const newUser = {
      _id: 'u' + Math.random().toString(36).substr(2, 9),
      username,
      email: email,
      phone: phone || null,
      emailVerified: false, // Email verification required
      phoneVerified: !phone,
      emailVerificationCode: emailVerificationCode,
      phoneVerificationCode: phoneVerificationCode,
      role,
      department,
      clearanceLevel: 1,
      mfaEnabled: true, // MFA is now mandatory for all users
      passwordHash,
      failedAttempts: 0,
      lockedUntil: null,
      refreshToken: null,
      pendingOtp: null,
      roleAuditTrail: [],
      profile: {
        firstName: '',
        lastName: '',
        bio: '',
        avatar: null,
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
    
    await db.collection('users').insertOne(newUser);
    await createLogEntry(newUser._id, newUser.username, 'REGISTER', 'New user registered', 'SUCCESS');
    
    if (emailVerificationCode) {
      this.verificationCodes.set(`email_${newUser._id}`, {
        code: emailVerificationCode,
        expiresAt: Date.now() + securityConfig.mfa.codeExpiry,
        type: 'email',
      });
    }
    if (phoneVerificationCode) {
      this.verificationCodes.set(`phone_${newUser._id}`, {
        code: phoneVerificationCode,
        expiresAt: Date.now() + securityConfig.mfa.codeExpiry,
        type: 'phone',
      });
    }
    
    const safeUser = { 
      _id: newUser._id, 
      username: newUser.username, 
      role: newUser.role, 
      department: newUser.department, 
      clearanceLevel: newUser.clearanceLevel, 
      mfaEnabled: newUser.mfaEnabled,
      emailVerified: newUser.emailVerified,
      phoneVerified: newUser.phoneVerified,
    };
    // Don't return codes - user must check email
    return { 
      user: safeUser,
      emailSent: true,
      message: 'Verification code sent to your email',
    };
  }

  async logout(user) {
    await createLogEntry(user._id, user.username, 'LOGOUT', 'User signed out');
  }

  async changePassword(userId, oldPassword, newPassword) {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    if (!verifyPassword(oldPassword, user.passwordHash)) throw new Error('Invalid current password');
    
    const check = passwordPolicyCheck(newPassword);
    if (!check.ok) throw new Error(check.reason);
    
    const passwordHash = hashPassword(newPassword);
    await db.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash } });
    await createLogEntry(user._id, user.username, 'PASSWORD_CHANGE', 'User changed password', 'SUCCESS');
    return { ok: true };
  }

  async verifyEmail(userId, code) {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    
    // Check stored verification code or emailVerificationCode from registration
    const stored = this.verificationCodes.get(`email_${userId}`);
    const dbCode = user.emailVerificationCode;
    
    let codeValid = false;
    if (stored && stored.code === code) {
      codeValid = true;
    } else if (dbCode && dbCode === code) {
      codeValid = true;
    }
    
    if (!codeValid) throw new Error('Invalid verification code');
    
    // Check expiration (10 minutes from creation)
    const codeAge = Date.now() - (user.createdAt ? new Date(user.createdAt).getTime() : Date.now());
    if (codeAge > securityConfig.mfa.codeExpiry) {
      throw new Error('Verification code expired');
    }
    
    await db.collection('users').updateOne({ _id: userId }, { $set: { emailVerified: true, emailVerificationCode: null } });
    if (stored) this.verificationCodes.delete(`email_${userId}`);
    await createLogEntry(userId, user.username, 'EMAIL_VERIFIED', 'Email verified', 'SUCCESS');
    return { ok: true };
  }

  async verifyPhone(userId, code) {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    
    const stored = this.verificationCodes.get(`phone_${userId}`);
    if (!stored || stored.code !== code) throw new Error('Invalid verification code');
    if (Date.now() > stored.expiresAt) {
      this.verificationCodes.delete(`phone_${userId}`);
      throw new Error('Verification code expired');
    }
    
    await db.collection('users').updateOne({ _id: userId }, { $set: { phoneVerified: true } });
    this.verificationCodes.delete(`phone_${userId}`);
    await createLogEntry(userId, user.username, 'PHONE_VERIFIED', 'Phone verified', 'SUCCESS');
    return { ok: true };
  }

  async enableMFA(userId, mfaType, verificationCode) {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) throw new Error('User not found');

    if (!user.email) {
      throw new Error('Email is required to enable MFA');
    }

    // For email-based MFA, send a verification code
    if (mfaType === 'EMAIL') {
      const mfaCode = MFAService.generateSMSOTP();
      
      // Store code temporarily
      this.verificationCodes.set(`mfa_setup_${userId}`, {
        code: mfaCode,
        expiresAt: Date.now() + securityConfig.mfa.codeExpiry,
        type: 'mfa_setup',
      });

      // Send code to email
      await MFAService.sendEmailCode(user.email, user.username, mfaCode, 'MFA Setup Verification');
      
      // If verification code provided, verify it
      if (verificationCode) {
        const stored = this.verificationCodes.get(`mfa_setup_${userId}`);
        if (!stored || stored.code !== verificationCode) {
          throw new Error('Invalid verification code');
        }
        if (Date.now() > stored.expiresAt) {
          this.verificationCodes.delete(`mfa_setup_${userId}`);
          throw new Error('Verification code expired');
        }
        
        // Enable MFA
        await db.collection('users').updateOne({ _id: userId }, { $set: { mfaEnabled: true } });
        this.verificationCodes.delete(`mfa_setup_${userId}`);
        await createLogEntry(userId, user.username, 'MFA_ENABLED', 'MFA enabled via email', 'SUCCESS');
        return { ok: true, message: 'MFA enabled successfully' };
      } else {
        return { ok: true, codeSent: true, message: 'Verification code sent to your email' };
      }
    }

    throw new Error('Unsupported MFA type');
  }
}

export const authController = new AuthController();
export default authController;

