import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { MongoClient } from 'mongodb';

// Load .env file from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

// Default to local MongoDB with database name in URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_archive';
// Extract database name from URI if provided, otherwise use separate env var or default
const extractDbName = (uri) => {
  // Match database name after the last slash, before query params
  // e.g., mongodb://127.0.0.1:27017/secure_archive -> secure_archive
  const parts = uri.split('/');
  if (parts.length > 3) {
    const dbPart = parts[parts.length - 1].split('?')[0]; // Remove query params
    return dbPart || null;
  }
  return null;
};
const MONGO_DB = process.env.MONGO_DB || extractDbName(MONGO_URI) || 'secure_archive';

let client = null;
let db = null;

export const connectToDb = async (retries = 3) => {
  console.log(`[Database] Attempting to connect... URI: ${MONGO_URI}, DB: ${MONGO_DB}`);
  
  if (!MONGO_URI) {
    console.error('[Database] MONGO_URI is not set!');
    return null;
  }
  
  // Check if existing connection is still alive
  if (client && db) {
    try {
      await client.db('admin').command({ ping: 1 });
      console.log('[Database] Using existing connection');
      return { client, db };
    } catch (err) {
      console.log('[Database] Existing connection lost, reconnecting...');
      client = null;
      db = null;
    }
  }

  for (let i = 0; i < retries; i++) {
    try {
      // Clean URI: Remove database name and query params for MongoClient connection
      // MongoClient doesn't use database name from URI, we specify it separately
      const uriParts = MONGO_URI.split('/');
      const baseUri = uriParts.slice(0, 3).join('/'); // Keep mongodb://host:port
      const queryString = uriParts[uriParts.length - 1].split('?')[1] || '';
      const cleanUri = queryString ? `${baseUri}?${queryString}` : baseUri;
      
      
      
      client = new MongoClient(cleanUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 1,
      });
      
      await client.connect();
      
      // Set up connection event listeners
      client.on('error', (err) => {
        console.error('[Database] Connection error:', err.message);
        client = null;
        db = null;
      });
      
      client.on('close', () => {
        console.warn('[Database] Connection closed');
        client = null;
        db = null;
      });
      
      db = client.db(MONGO_DB);
      
      // Verify connection by checking collections
      const collections = await db.listCollections().toArray();
      const usersCount = await db.collection('users').countDocuments().catch(() => 0);
      const logsCount = await db.collection('logs').countDocuments().catch(() => 0);
      
      console.log(`Database Connected to MongoDB: ${baseUri}`);    
      
      return { client, db };
    } catch (err) {
      console.error(`[Database] Attempt ${i + 1}/${retries} failed:`, err.message);
      console.error(`[Database] Error details:`, err);
      if (client) {
        try {
          await client.close();
        } catch (closeErr) {
          // Ignore close errors
        }
        client = null;
        db = null;
      }
      if (i < retries - 1) {
        console.log('[Database] Retrying in 2 seconds...');
        await new Promise((r) => setTimeout(r, 2000)); // wait 2s before retry
      }
    }
  }
  throw new Error('[Database] All connection attempts failed');
};


export const getDb = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectToDb() first.');
  }
  return db;
};

// Health check function for connection monitoring
export const checkConnection = async () => {
  if (!client || !db) {
    return false;
  }
  try {
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch (err) {
    console.warn('[Database] Connection health check failed:', err.message);
    client = null;
    db = null;
    return false;
  }
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
    
  } catch (error) {
    console.error('[Database] Failed to create indexes:', error);
  }
};

