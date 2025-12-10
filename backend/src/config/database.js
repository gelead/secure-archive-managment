import 'dotenv/config';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || '';
const MONGO_DB = process.env.MONGO_DB || 'secure_archive';

let client = null;
let db = null;

export const connectToDb = async (retries = 3) => {
  if (!MONGO_URI) return null;
  if (client && db) return { client, db };

  for (let i = 0; i < retries; i++) {
    try {
      client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      await client.connect();
      db = client.db(MONGO_DB);
      console.log('[Database] Connected to MongoDB');
      return { client, db };
    } catch (err) {
      console.warn(`[Database] Attempt ${i + 1} failed:`, err.message);
      await new Promise((r) => setTimeout(r, 2000)); // wait 2s before retry
    }
  }
  throw new Error('[Database] All connection attempts failed');
};


export const getDb = () => {
  if (!db) throw new Error('Database not connected. Call connectToDb() first.');
  return db;
};

export const getCollection = (name) => {
  if (!db) throw new Error('Database not connected');
  return db.collection(name);
};

export const closeDb = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[Database] Connection closed');
  }
};

export const createIndexes = async () => {
  if (!db) return;
  
  try {
    // Users indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    // Partial filter indexes allow multiple null values - only unique non-null values are enforced
    await db.collection('users').createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true, $type: 'string' } } });
    await db.collection('users').createIndex({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $exists: true, $type: 'string' } } });
    await db.collection('users').createIndex({ role: 1 });
    
    // Files indexes
    await db.collection('files').createIndex({ _id: 1 });
    await db.collection('files').createIndex({ ownerId: 1 });
    await db.collection('files').createIndex({ classification: 1 });
    await db.collection('files').createIndex({ department: 1 });
    
    // Logs indexes
    await db.collection('logs').createIndex({ timestamp: -1 });
    await db.collection('logs').createIndex({ userId: 1 });
    await db.collection('logs').createIndex({ action: 1 });
    await db.collection('logs').createIndex({ status: 1 });
    
    // Sessions indexes
    await db.collection('sessions').createIndex({ sessionId: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    // Permission logs indexes
    await db.collection('permissionLogs').createIndex({ fileId: 1 });
    await db.collection('permissionLogs').createIndex({ timestamp: -1 });
    await db.collection('permissionLogs').createIndex({ grantedTo: 1 });
    
    // Role requests indexes
    await db.collection('roleRequests').createIndex({ userId: 1 });
    await db.collection('roleRequests').createIndex({ status: 1 });
    await db.collection('roleRequests').createIndex({ createdAt: -1 });
    
    // Leave requests indexes
    await db.collection('leaveRequests').createIndex({ userId: 1 });
    await db.collection('leaveRequests').createIndex({ status: 1 });
    await db.collection('leaveRequests').createIndex({ createdAt: -1 });
    
    console.log('[Database] Indexes created successfully');
  } catch (error) {
    console.error('[Database] Failed to create indexes:', error);
  }
};

