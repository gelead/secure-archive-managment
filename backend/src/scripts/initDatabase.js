import { connectToDb, createIndexes } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { hashPassword } from '../utils/auth.js';
import { Role, AccessModel } from '../utils/constants.js';

/**
 * Initialize database with default data
 */
export const initDatabase = async () => {
  try {
    await connectToDb();
    await createIndexes();
    
    const { getDb } = await import('../config/database.js');
    const db = getDb();
    
    // Create default admin user if not exists
    const adminExists = await db.collection('users').findOne({ username: 'admin' });
    if (!adminExists) {
      // Use SMTP_USER email if configured, otherwise use demo email
      const adminEmail = process.env.SMTP_USER || 'admin@company.com';
      const adminUser = {
        _id: 'admin',
        username: 'admin',
        email: adminEmail,
        phone: '+1234567890',
        emailVerified: true,
        phoneVerified: true,
        passwordHash: hashPassword('Admin@123!'),
        role: Role.ADMIN,
        department: 'IT',
        clearanceLevel: 3,
        mfaEnabled: true, // MFA is mandatory
        failedAttempts: 0,
        lockedUntil: null,
        refreshToken: null,
        pendingOtp: null,
        roleAuditTrail: [],
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          bio: 'System Administrator',
          avatar: null,
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      };
      
      await db.collection('users').insertOne(adminUser);
      console.log('[Init] Default admin user created (username: admin, password: Admin@123!)');
      console.log(`[Init] Admin email set to: ${adminEmail}`);
      if (!process.env.SMTP_USER) {
        console.log('[Init] ⚠️  WARNING: SMTP_USER not configured. Admin email is demo address.');
        console.log('[Init] ⚠️  Update admin email in database or set SMTP_USER in .env before first login.');
      }
    } else {
      // Update existing admin email if SMTP_USER is configured and different
      if (process.env.SMTP_USER && adminExists.email !== process.env.SMTP_USER) {
        await db.collection('users').updateOne(
          { username: 'admin' },
          { $set: { email: process.env.SMTP_USER } }
        );
        console.log(`[Init] Updated admin email to: ${process.env.SMTP_USER}`);
      }
    }
    
    // Initialize access model setting
    const modelExists = await db.collection('settings').findOne({ key: 'accessModel' });
    if (!modelExists) {
      await db.collection('settings').insertOne({ key: 'accessModel', value: AccessModel.RBAC });
      console.log('[Init] Default access model set to RBAC');
    }
    
    // Seed demo files if collection is empty
    const fileCount = await db.collection('files').countDocuments();
    if (fileCount === 0) {
      const { demoFiles } = await import('../../../database/seeds/demoFiles.js');
      
      // Ensure demo file owners exist
      const adminUser = await db.collection('users').findOne({ username: 'admin' });
      const managerUser = await db.collection('users').findOne({ username: 'alice_manager' });
      const staffUser = await db.collection('users').findOne({ username: 'bob_staff' });
      
      // Only insert files if at least admin exists
      if (adminUser) {
        // Update file ownerIds to match existing users
        const filesToInsert = demoFiles.map(file => {
          // Map owner usernames to actual user IDs
          if (file.ownerUsername === 'admin' && adminUser) {
            file.ownerId = adminUser._id;
          } else if (file.ownerUsername === 'alice_manager' && managerUser) {
            file.ownerId = managerUser._id;
          } else if (file.ownerUsername === 'bob_staff' && staffUser) {
            file.ownerId = staffUser._id;
          }
          
          // Update sharedWith user IDs
          if (file.sharedWith && file.sharedWith.length > 0) {
            file.sharedWith = file.sharedWith.map(username => {
              if (username === 'admin' && adminUser) return adminUser._id;
              if (username === 'alice_manager' && managerUser) return managerUser._id;
              if (username === 'bob_staff' && staffUser) return staffUser._id;
              return username;
            });
          }
          
          // Update permissions user IDs
          if (file.permissions) {
            const updatedPermissions = {};
            for (const [userId, permData] of Object.entries(file.permissions)) {
              let actualUserId = userId;
              if (userId === 'admin' && adminUser) actualUserId = adminUser._id;
              if (userId === 'alice_manager' && managerUser) actualUserId = managerUser._id;
              if (userId === 'bob_staff' && staffUser) actualUserId = staffUser._id;
              
              // Update grantedBy in permissions
              if (permData.grantedBy === 'admin' && adminUser) permData.grantedBy = adminUser._id;
              if (permData.grantedBy === 'alice_manager' && managerUser) permData.grantedBy = managerUser._id;
              if (permData.grantedBy === 'bob_staff' && staffUser) permData.grantedBy = staffUser._id;
              
              updatedPermissions[actualUserId] = permData;
            }
            file.permissions = updatedPermissions;
          }
          
          return file;
        });
        
        await db.collection('files').insertMany(filesToInsert);
        console.log(`[Init] ${filesToInsert.length} demo files created`);
      }
    }
    
    await createLogEntry('SYSTEM', 'SYSTEM', 'DB_INIT', 'Database initialized with default data');
    console.log('[Init] Database initialization completed');
    
    return { success: true };
  } catch (error) {
    console.error('[Init] Database initialization failed:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      console.log('Database initialized successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export default initDatabase;

