// backend/scripts/migrateUserRoles.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Trainer = require('./src/models/Trainer');

const migrateUserRoles = async () => {
  try {
    console.log('🔄 Starting user role migration...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users with role 'user'
    const usersToMigrate = await User.find({ role: 'user' });
    console.log(`📊 Found ${usersToMigrate.length} users with role 'user'\n`);

    if (usersToMigrate.length === 0) {
      console.log('✨ No users need migration. All done!');
      process.exit(0);
    }

    let trainerCount = 0;
    let studentCount = 0;

    // Process each user
    for (const user of usersToMigrate) {
      // Check if user has a trainer profile
      const trainerProfile = await Trainer.findOne({ 
        $or: [
          { email: user.email },
          { createdBy: user._id }
        ]
      });

      if (trainerProfile) {
        // User has trainer profile -> make them a trainer
        user.role = 'trainer';
        await user.save();
        trainerCount++;
        console.log(`👨‍🏫 ${user.email} → TRAINER (has profile)`);
      } else {
        // User has no trainer profile -> make them a student
        user.role = 'student';
        await user.save();
        studentCount++;
        console.log(`👨‍🎓 ${user.email} → STUDENT (no profile)`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Trainers: ${trainerCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Total: ${trainerCount + studentCount}`);
    console.log('\n✅ Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateUserRoles();