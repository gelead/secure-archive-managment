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
      const adminUser = {
        _id: 'admin',
        username: 'admin',
        email: 'admin@company.com',
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
    }
    
    // Initialize access model setting
    const modelExists = await db.collection('settings').findOne({ key: 'accessModel' });
    if (!modelExists) {
      await db.collection('settings').insertOne({ key: 'accessModel', value: AccessModel.RBAC });
      console.log('[Init] Default access model set to RBAC');
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

