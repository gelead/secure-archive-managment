/**
 * Update admin email script
 * Updates the admin user's email to match SMTP_USER from environment
 * Run with: node backend/src/scripts/updateAdminEmail.js
 */

import { connectToDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';

const updateAdminEmail = async () => {
  try {
    await connectToDb();
    const { getDb } = await import('../config/database.js');
    const db = getDb();
    
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) {
      console.error('[UpdateAdminEmail] SMTP_USER not configured in .env file');
      console.error('[UpdateAdminEmail] Please set SMTP_USER in your .env file first');
      process.exit(1);
    }
    
    const adminUser = await db.collection('users').findOne({ username: 'admin' });
    if (!adminUser) {
      console.error('[UpdateAdminEmail] Admin user not found. Please run init-db first.');
      process.exit(1);
    }
    
    if (adminUser.email === smtpUser) {
      console.log(`[UpdateAdminEmail] Admin email is already set to: ${smtpUser}`);
      process.exit(0);
    }
    
    // Check if another user already has this email
    const existingUser = await db.collection('users').findOne({ 
      email: smtpUser,
      username: { $ne: 'admin' }
    });
    
    if (existingUser) {
      console.error(`[UpdateAdminEmail] ❌ Email ${smtpUser} is already used by user: ${existingUser.username}`);
      console.error('[UpdateAdminEmail] Please use a different email or update that user first.');
      process.exit(1);
    }
    
    // Check if admin already has this email (might be a different user record)
    const adminWithEmail = await db.collection('users').findOne({ 
      email: smtpUser,
      username: 'admin'
    });
    
    if (adminWithEmail && adminWithEmail._id === adminUser._id) {
      console.log(`[UpdateAdminEmail] Admin email is already set to: ${smtpUser}`);
      process.exit(0);
    }
    
    await db.collection('users').updateOne(
      { username: 'admin' },
      { $set: { email: smtpUser } }
    );
    
    console.log(`[UpdateAdminEmail] ✅ Successfully updated admin email from ${adminUser.email} to ${smtpUser}`);
    
    await createLogEntry(
      adminUser._id,
      'admin',
      'ADMIN_EMAIL_UPDATED',
      `Admin email updated to ${smtpUser}`,
      'SUCCESS'
    );
    
    process.exit(0);
  } catch (error) {
    console.error('[UpdateAdminEmail] Error updating admin email:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateAdminEmail();
}

export default updateAdminEmail;
