/**
 * Seed demo files script
 * Adds demo files to the archive for testing and demonstration
 * Run with: node backend/src/scripts/seedDemoFiles.js
 */

import { connectToDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';

const seedDemoFiles = async () => {
  try {
    await connectToDb();
    const { getDb } = await import('../config/database.js');
    const db = getDb();
    
    // Import demo files
    const { demoFiles } = await import('../../../database/seeds/demoFiles.js');
    
    // Get existing users to map owner IDs
    const adminUser = await db.collection('users').findOne({ username: 'admin' });
    const managerUser = await db.collection('users').findOne({ username: 'alice_manager' });
    const staffUser = await db.collection('users').findOne({ username: 'bob_staff' });
    
    if (!adminUser) {
      console.error('[Seed] Admin user not found. Please run init-db first.');
      process.exit(1);
    }
    
    // Check if files already exist
    const existingFiles = await db.collection('files').find({}).toArray();
    if (existingFiles.length > 0) {
      console.log(`[Seed] ${existingFiles.length} files already exist. Skipping seed.`);
      console.log('[Seed] To re-seed, delete existing files first or use --force flag');
      process.exit(0);
    }
    
    // Map file owner IDs to actual user IDs
    const filesToInsert = demoFiles.map(file => {
      const fileCopy = { ...file };
      
      // Map owner usernames to actual user IDs
      if (file.ownerUsername === 'admin' && adminUser) {
        fileCopy.ownerId = adminUser._id;
      } else if (file.ownerUsername === 'alice_manager' && managerUser) {
        fileCopy.ownerId = managerUser._id;
      } else if (file.ownerUsername === 'bob_staff' && staffUser) {
        fileCopy.ownerId = staffUser._id;
      } else {
        // Default to admin if user not found
        fileCopy.ownerId = adminUser._id;
      }
      
      // Update sharedWith user IDs
      if (fileCopy.sharedWith && fileCopy.sharedWith.length > 0) {
        fileCopy.sharedWith = fileCopy.sharedWith.map(username => {
          if (username === 'admin' && adminUser) return adminUser._id;
          if (username === 'alice_manager' && managerUser) return managerUser._id;
          if (username === 'bob_staff' && staffUser) return staffUser._id;
          return username;
        });
      }
      
      // Update permissions user IDs
      if (fileCopy.permissions) {
        const updatedPermissions = {};
        for (const [userId, permData] of Object.entries(fileCopy.permissions)) {
          let actualUserId = userId;
          if (userId === 'admin' && adminUser) actualUserId = adminUser._id;
          if (userId === 'alice_manager' && managerUser) actualUserId = managerUser._id;
          if (userId === 'bob_staff' && staffUser) actualUserId = staffUser._id;
          
          // Update grantedBy in permissions
          const permDataCopy = { ...permData };
          if (permDataCopy.grantedBy === 'admin' && adminUser) permDataCopy.grantedBy = adminUser._id;
          if (permDataCopy.grantedBy === 'alice_manager' && managerUser) permDataCopy.grantedBy = managerUser._id;
          if (permDataCopy.grantedBy === 'bob_staff' && staffUser) permDataCopy.grantedBy = staffUser._id;
          
          updatedPermissions[actualUserId] = permDataCopy;
        }
        fileCopy.permissions = updatedPermissions;
      }
      
      return fileCopy;
    });
    
    // Insert files
    await db.collection('files').insertMany(filesToInsert);
    console.log(`[Seed] ✅ Successfully created ${filesToInsert.length} demo files`);
    
    // Log the action
    await createLogEntry(
      adminUser._id,
      'admin',
      'DEMO_FILES_SEEDED',
      `Seeded ${filesToInsert.length} demo files for testing`,
      'SUCCESS'
    );
    
    // Print summary
    const publicFiles = filesToInsert.filter(f => f.classification === 'Public').length;
    const internalFiles = filesToInsert.filter(f => f.classification === 'Internal').length;
    const confidentialFiles = filesToInsert.filter(f => f.classification === 'Confidential').length;
    
    console.log('\n[Seed] File Summary:');
    console.log(`  - Public files: ${publicFiles}`);
    console.log(`  - Internal files: ${internalFiles}`);
    console.log(`  - Confidential files: ${confidentialFiles}`);
    console.log(`  - Total: ${filesToInsert.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding demo files:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoFiles();
}

export default seedDemoFiles;
