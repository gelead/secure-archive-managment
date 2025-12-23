import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { MongoClient } from 'mongodb';

// Load .env file from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_archive';

console.log('MONGO_URI from .env:', MONGO_URI);

// Extract database name
const extractDbName = (uri) => {
  const parts = uri.split('/');
  if (parts.length > 3) {
    const dbPart = parts[parts.length - 1].split('?')[0];
    return dbPart || null;
  }
  return null;
};

const MONGO_DB = process.env.MONGO_DB || extractDbName(MONGO_URI) || 'secure_archive';
console.log('MONGO_DB:', MONGO_DB);

// Clean URI
const uriParts = MONGO_URI.split('/');
const baseUri = uriParts.slice(0, 3).join('/');
const queryString = uriParts[uriParts.length - 1].split('?')[1] || '';
const cleanUri = queryString ? `${baseUri}?${queryString}` : baseUri;

console.log('Clean URI for connection:', cleanUri);

async function testConnection() {
  try {
    const client = new MongoClient(cleanUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(MONGO_DB);
    console.log(`✓ Using database: ${MONGO_DB}`);
    
    // Test collections
    const usersCount = await db.collection('users').countDocuments();
    const logsCount = await db.collection('logs').countDocuments();
    
    console.log(`✓ Users collection: ${usersCount} documents`);
    console.log(`✓ Logs collection: ${logsCount} documents`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('✓ Collections:', collections.map(c => c.name).join(', '));
    
    await client.close();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

