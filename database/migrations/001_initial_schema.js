/**
 * Initial database schema migration
 * Creates collections and indexes
 */
export const up = async (db) => {
  // Collections are created automatically in MongoDB
  // This migration ensures indexes exist
  
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
  await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
  await db.collection('users').createIndex({ role: 1 });
  
  await db.collection('files').createIndex({ _id: 1 });
  await db.collection('files').createIndex({ ownerId: 1 });
  await db.collection('files').createIndex({ classification: 1 });
  await db.collection('files').createIndex({ department: 1 });
  
  await db.collection('logs').createIndex({ timestamp: -1 });
  await db.collection('logs').createIndex({ userId: 1 });
  await db.collection('logs').createIndex({ action: 1 });
  await db.collection('logs').createIndex({ status: 1 });
  
  await db.collection('sessions').createIndex({ sessionId: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ userId: 1 });
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  
  await db.collection('permissionLogs').createIndex({ fileId: 1 });
  await db.collection('permissionLogs').createIndex({ timestamp: -1 });
  await db.collection('permissionLogs').createIndex({ grantedTo: 1 });
  
  await db.collection('roleRequests').createIndex({ userId: 1 });
  await db.collection('roleRequests').createIndex({ status: 1 });
  await db.collection('roleRequests').createIndex({ createdAt: -1 });
  
  await db.collection('settings').createIndex({ key: 1 }, { unique: true });
};

export const down = async (db) => {
  // Drop indexes (collections remain)
  const collections = ['users', 'files', 'logs', 'sessions', 'permissionLogs', 'roleRequests', 'settings'];
  for (const collectionName of collections) {
    try {
      await db.collection(collectionName).dropIndexes();
    } catch (e) {
      // Indexes may not exist
    }
  }
};

export default { up, down };

