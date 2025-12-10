# ⚠️ SMTP Configuration Required

## Critical: Email Configuration is MANDATORY

**MFA (Multi-Factor Authentication) is now MANDATORY for all users.** The system requires SMTP email configuration to send verification codes.

## Quick Setup

Add these lines to your `.env` file in the root directory:

```bash
# Email Configuration (REQUIRED for MFA)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Gmail Setup (Recommended)

1. **Enable 2-Step Verification** on your Google account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Secure Archive" as the name
   - Copy the generated 16-character password (format: `xxxx xxxx xxxx xxxx`)
   - Use this as `SMTP_PASS` (remove spaces or keep them, both work)

3. **Update `.env`**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=your-email@gmail.com
```

## After Configuration

1. **Restart the backend server**:
   ```bash
   npm run restart-server
   ```

2. **Check server logs** - You should see:
   ```
   [Email] ✅ SMTP connection verified successfully
   ```

3. **Test login** - You should receive verification codes in your email

## Troubleshooting

### "SMTP not configured" error
- Check that all SMTP variables are set in `.env`
- Restart the server after changing `.env`
- Check server logs for connection errors

### "Failed to send email" error
- Verify SMTP credentials are correct
- For Gmail, ensure you're using an App Password (not regular password)
- Check firewall/network settings
- Try different SMTP port (587 or 465)

### No emails received
- Check spam/junk folder
- Verify email address is correct
- Check server logs for email sending status
- Ensure SMTP connection was verified on startup

## Important Notes

- **MFA is now MANDATORY** - Users cannot login without email verification
- **Email is required** - All users must have a valid email address
- **SMTP must be configured** - System will not work without email configuration
- **Codes expire in 10 minutes** - Users must enter code promptly

## Alternative Email Providers

See `EMAIL_SETUP.md` for configuration details for:
- Outlook/Hotmail
- Yahoo Mail
- Custom SMTP servers

