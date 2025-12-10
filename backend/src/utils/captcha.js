// CAPTCHA verification utility
// Supports quiz-based CAPTCHA and can integrate with reCAPTCHA

export const verifyCaptcha = async (token) => {
  if (!token) {
    return { valid: false, error: 'CAPTCHA token required' };
  }

  // Quiz-based CAPTCHA tokens start with 'captcha_'
  if (token.startsWith('captcha_')) {
    // Verify the token format and timestamp
    const parts = token.split('_');
    if (parts.length >= 3) {
      const timestamp = parseInt(parts[2]);
      const now = Date.now();
      // Token is valid for 10 minutes
      if (now - timestamp < 10 * 60 * 1000) {
        return { valid: true };
      } else {
        return { valid: false, error: 'CAPTCHA token expired' };
      }
    }
    return { valid: false, error: 'Invalid CAPTCHA token format' };
  }

  // Legacy support for 'verified' token (for backward compatibility)
  if (token === 'verified') {
    return { valid: true };
  }

  // Example: Verify with reCAPTCHA (for production)
  // const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
  // });
  // const data = await response.json();
  // return { valid: data.success, error: data.success ? null : 'CAPTCHA verification failed' };

  return { valid: false, error: 'Invalid CAPTCHA token' };
};

export default { verifyCaptcha };

