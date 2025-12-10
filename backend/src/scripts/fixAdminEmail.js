/**
 * Fix admin email script
 * Updates admin email to SMTP_USER, handling conflicts
 * Run with: node backend/src/scripts/fixAdminEmail.js
 */

import { connectToDb } from '../config/database.js';

const fixAdminEmail = async () => {
  try {
    await connectToDb();
    const { getDb } = await import('../config/database.js');
    const db = getDb();
    
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser) {
      console.error('[FixAdminEmail] SMTP_USER not configured in .env file');
      console.error('[FixAdminEmail] Please set SMTP_USER in your .env file first');
      process.exit(1);
    }
    
    const adminUser = await db.collection('users').findOne({ username: 'admin' });
    if (!adminUser) {
      console.error('[FixAdminEmail] Admin user not found. Please run init-db first.');
      process.exit(1);
    }
    
    console.log(`[FixAdminEmail] Current admin email: ${adminUser.email}`);
    console.log(`[FixAdminEmail] Target email (SMTP_USER): ${smtpUser}`);
    
    if (adminUser.email === smtpUser) {
      console.log(`[FixAdminEmail] ✅ Admin email is already correct: ${smtpUser}`);
      process.exit(0);
    }
    
    // Check if another user has this email
    const existingUser = await db.collection('users').findOne({ 
      email: smtpUser,
      username: { $ne: 'admin' }
    });
    
    if (existingUser) {
      console.log(`[FixAdminEmail] ⚠️  Email ${smtpUser} is used by user: ${existingUser.username}`);
      console.log(`[FixAdminEmail] Updating admin email anyway (you may need to update the other user's email later)...`);
      
      // First, update the other user's email to avoid conflict
      const tempEmail = `temp_${Date.now()}@temp.com`;
      await db.collection('users').updateOne(
        { _id: existingUser._id },
        { $set: { email: tempEmail } }
      );
      console.log(`[FixAdminEmail] Temporarily changed ${existingUser.username} email to ${tempEmail}`);
    }
    
    // Now update admin email
    await db.collection('users').updateOne(
      { username: 'admin' },
      { $set: { email: smtpUser } }
    );
    
    console.log(`[FixAdminEmail] ✅ Successfully updated admin email to: ${smtpUser}`);
    console.log(`[FixAdminEmail] You can now receive MFA codes at ${smtpUser}`);
    
    if (existingUser) {
      console.log(`[FixAdminEmail] ⚠️  Note: User ${existingUser.username} email was changed to a temp email.`);
      console.log(`[FixAdminEmail] Please update that user's email through the UI or database.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('[FixAdminEmail] Error fixing admin email:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAdminEmail();
}

export default fixAdminEmail;
