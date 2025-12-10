import { generateOTP, verifyOTP, generateOTPCode } from '../utils/auth.js';
import { BiometricAuth } from '../utils/auth.js';
import { securityConfig } from '../config/security.js';
import { EmailService } from './emailService.js';

export class MFAService {
  static generateTOTP() {
    return generateOTP();
  }

  static verifyTOTP(secret, token) {
    return verifyOTP(secret, token);
  }

  static generateSMSOTP() {
    return generateOTPCode();
  }

  static async sendEmailCode(email, username, code, purpose = 'Verification') {
    if (purpose === 'Email Verification') {
      return await EmailService.sendEmailVerificationOTP(email, username, code);
    }
    return await EmailService.sendMFACode(email, username, code);
  }

  static async sendMFACodeToEmail(email, username, code) {
    return await EmailService.sendMFACode(email, username, code);
  }

  static async verifyBiometric(userId, credentialId, signature) {
    return await BiometricAuth.verifyBiometric(userId, credentialId, signature);
  }

  static async registerBiometric(userId, credentialId, publicKey) {
    return await BiometricAuth.registerBiometric(userId, credentialId, publicKey);
  }

  static isBiometricAvailable() {
    return BiometricAuth.isAvailable();
  }

  static getCodeExpiry() {
    return securityConfig.mfa.codeExpiry;
  }
}

export default MFAService;

