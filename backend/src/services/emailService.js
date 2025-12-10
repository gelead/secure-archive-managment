import nodemailer from 'nodemailer';

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@securearchive.com';

// Create transporter
let transporter = null;

const getTransporter = async () => {
  // Require SMTP credentials
  if (!SMTP_USER || !SMTP_PASS) {
    const error = new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
    console.error('[EmailService]', error.message);
    throw error;
  }

  // Reuse existing transporter if available
  if (transporter) {
    return transporter;
  }

  // Configure based on port
  const isSecure = SMTP_PORT === 465 || SMTP_SECURE;
  const config = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: isSecure, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  };

  // Only set requireTLS for port 587 (STARTTLS)
  if (SMTP_PORT === 587) {
    config.requireTLS = true;
  }

  // TLS settings - Gmail specific configuration
  if (SMTP_HOST.includes('gmail.com')) {
    // Gmail-specific settings
    config.tls = {
      rejectUnauthorized: false, // Gmail certificates are valid, but be lenient
      minVersion: 'TLSv1.2',
    };
  } else {
    config.tls = {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    };
  }

  console.log(`[EmailService] Creating SMTP transporter: ${SMTP_HOST}:${SMTP_PORT} (secure: ${isSecure})`);
  console.log(`[EmailService] User: ${SMTP_USER}`);
  
  transporter = nodemailer.createTransport(config);

  // Verify connection (async)
  try {
    await transporter.verify();
    console.log('[EmailService] ✅ SMTP connection verified successfully');
    console.log(`[EmailService] Using ${SMTP_HOST}:${SMTP_PORT} (secure: ${isSecure})`);
  } catch (error) {
    console.error('[EmailService] ❌ SMTP connection verification failed:', error.message);
    console.error('[EmailService] Full error:', error);
    console.error('[EmailService] Please check your SMTP settings in .env file');
    // Reset transporter on verification failure
    transporter = null;
    // Don't throw here - let it fail when trying to send
  }

  return transporter;
};

export class EmailService {
  /**
   * Send email verification OTP
   */
  static async sendEmailVerificationOTP(email, username, otp) {
    try {
      const subject = 'Email Verification Code - Secure Archive';
      const text = `Hello ${username},\n\nYour email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nSecure Archive Team`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Secure Archive</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hello <strong>${username}</strong>,</p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Your email verification code is:</p>
            <div style="background-color: #1e293b; color: #60a5fa; font-size: 36px; font-weight: bold; text-align: center; padding: 25px; margin: 30px 0; border-radius: 8px; letter-spacing: 6px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you didn't request this code, please ignore this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Best regards,<br>
              Secure Archive Team
            </p>
          </div>
        </div>
      `;

      return await this.sendEmail(email, subject, text, html);
    } catch (error) {
      console.error('[EmailService] Failed to send email verification OTP:', error.message);
      throw error;
    }
  }

  /**
   * Send MFA/Login verification code
   */
  static async sendMFACode(email, username, otp) {
    try {
      const subject = 'Multi-Factor Authentication Code - Secure Archive';
      const text = `Hello ${username},\n\nYour MFA verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nSecure Archive Team`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Secure Archive</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hello <strong>${username}</strong>,</p>
            <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Your multi-factor authentication code is:</p>
            <div style="background-color: #1e293b; color: #60a5fa; font-size: 36px; font-weight: bold; text-align: center; padding: 25px; margin: 30px 0; border-radius: 8px; letter-spacing: 6px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you didn't request this code, please ignore this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Best regards,<br>
              Secure Archive Team
            </p>
          </div>
        </div>
      `;

      return await this.sendEmail(email, subject, text, html);
    } catch (error) {
      console.error('[EmailService] Failed to send MFA code:', error.message);
      throw error;
    }
  }

  /**
   * Generic email sending method
   */
  static async sendEmail(to, subject, text, html = null) {
    try {
      // Check if SMTP is configured
      if (!SMTP_USER || !SMTP_PASS) {
        const errorMsg = 'SMTP not configured. Please configure SMTP settings in .env file (SMTP_HOST, SMTP_USER, SMTP_PASS)';
        console.error(`[EmailService] ${errorMsg}`);
        console.error(`[EmailService] Attempted to send to: ${to}`);
        console.error(`[EmailService] Subject: ${subject}`);
        throw new Error(errorMsg);
      }

      const mailOptions = {
        from: SMTP_FROM,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
      };

      console.log(`[EmailService] Attempting to send email to: ${to}`);
      console.log(`[EmailService] Subject: ${subject}`);
      
      const transport = await getTransporter();
      if (!transport) {
        const errorMsg = 'SMTP transporter not available. Connection verification may have failed. Check server logs for details.';
        console.error(`[EmailService] ❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      console.log(`[EmailService] Transporter ready, sending mail...`);
      const info = await transport.sendMail(mailOptions);
      
      console.log(`[EmailService] ✅ Successfully sent email to ${to}`);
      console.log(`[EmailService] Subject: ${subject}`);
      console.log(`[EmailService] Message ID: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      const errorMsg = `Failed to send email: ${error.message}`;
      console.error(`[EmailService] ❌ ${errorMsg}`);
      console.error(`[EmailService] To: ${to}`);
      console.error(`[EmailService] Subject: ${subject}`);
      console.error(`[EmailService] Error code: ${error.code || 'N/A'}`);
      console.error(`[EmailService] Error command: ${error.command || 'N/A'}`);
      console.error(`[EmailService] Full error stack:`, error.stack);
      console.error(`[EmailService] Full error object:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Reset transporter on send failure to allow retry
      if (transporter) {
        try {
          transporter.close();
        } catch (e) {
          // Ignore close errors
        }
        transporter = null;
      }
      
      // Re-throw to allow caller to handle
      throw new Error(errorMsg);
    }
  }
}

export default EmailService;

