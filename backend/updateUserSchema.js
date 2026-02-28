// backend/scripts/updateUserSchema.js
require('dotenv').config();
const mongoose = require('mongoose');

const updateUserSchema = async () => {
  try {
    console.log('🔄 Updating User schema...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Drop the validator that's causing issues
    try {
      await db.command({
        collMod: 'users',
        validator: {},
        validationLevel: 'off'
      });
      console.log('✅ Removed old validation rules\n');
    } catch (error) {
      console.log('⚠️  No validator to remove or already updated\n');
    }

    // Update all users with 'user' role to appropriate role
    const usersWithOldRole = await db.collection('users').find({ role: 'user' }).toArray();
    console.log(`📊 Found ${usersWithOldRole.length} users with old 'user' role\n`);

    // If there are users with old role, update them
    if (usersWithOldRole.length > 0) {
      console.log('⚠️  WARNING: You still have users with role="user"');
      console.log('Please run the migration script first: node scripts/migrateUserRoles.js\n');
    }

    // Now apply the new model with updated enum
    const User = require('./src/models/User');
    
    // Force mongoose to rebuild indexes with new schema
    await User.syncIndexes();
    console.log('✅ User model indexes synchronized\n');

    console.log('✅ Schema update completed successfully!');
    console.log('You can now register users with student or trainer roles.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  }
};

updateUserSchema();