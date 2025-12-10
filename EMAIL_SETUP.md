# Email Configuration Guide

## Overview

The system now sends real email codes for:
- Email verification during registration
- Multi-Factor Authentication (MFA) codes
- Login MFA verification codes

## Email Configuration

Add these variables to your `.env` file:

```bash
# Email Configuration (for MFA and verification codes)
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
   - Copy the generated 16-character password
   - Use this as `SMTP_PASS` (not your regular Gmail password)

3. **Configure `.env`**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-char app password
SMTP_FROM=your-email@gmail.com
```

## Other Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
```

### Custom SMTP Server
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

## Development Mode (No Email Setup)

If SMTP credentials are not configured, the system will:
- Log email content to the console instead of sending
- Still function normally for testing
- Show email codes in the registration verification screen

## Testing Email

1. Configure SMTP settings in `.env`
2. Restart the backend server
3. Register a new user with a valid email
4. Check your email inbox for the verification code
5. For MFA, enable it in Profile settings and check email for codes

## Troubleshooting

### Emails not sending
- Check SMTP credentials in `.env`
- Verify SMTP_HOST and SMTP_PORT are correct
- For Gmail, ensure you're using an App Password, not regular password
- Check server logs for email errors

### "SMTP not configured" message
- This is normal if SMTP credentials aren't set
- Emails will be logged to console instead
- Configure SMTP to send real emails

### Port 587 vs 465
- Port 587: STARTTLS (recommended)
- Port 465: SSL/TLS
- Update `SMTP_PORT` accordingly

## Security Notes

- Never commit `.env` file with real credentials
- Use App Passwords for Gmail (not regular passwords)
- In production, use environment variables or secure secret management
- Email codes expire after 10 minutes

