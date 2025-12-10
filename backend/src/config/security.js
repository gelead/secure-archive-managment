export const securityConfig = {
  // Password policy
  password: {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: true,
    requireDigit: true,
    requireSpecial: false,
  },

  // Account lockout
  accountLockout: {
    maxAttempts: 5,
    lockoutDuration: 5 * 60 * 1000, // 5 minutes
  },

  // JWT tokens
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenBytes: 32,
  },

  // Session
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 60 * 60 * 1000, // 1 hour
  },

  // MFA
  mfa: {
    otpWindow: 1, // Time step window for TOTP
    codeLength: 6,
    codeExpiry: 10 * 60 * 1000, // 10 minutes
  },

  // Encryption
  encryption: {
    logAlgorithm: 'aes-256-cbc',
    logKeyLength: 32,
  },

  // Backup
  backup: {
    interval: 60 * 60 * 1000, // 1 hour
    keepCount: 10,
  },

  // Alert thresholds
  alerts: {
    failedLoginAttempts: 5,
    suspiciousAccessAttempts: 10,
    anomalyThreshold: 0.8,
  },
};

export default securityConfig;

