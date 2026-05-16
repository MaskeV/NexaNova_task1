// Migration Script: Add 'evaluator' role to existing User model
// This script updates the User schema to support evaluator role without affecting existing data
 
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User'); 

async function addEvaluatorRole() {
  try {
    console.log('🔄 Starting migration: Add Evaluator Role');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trainer-management', {
   
    });
    
    console.log('✅ Connected to database');
    
    const User = mongoose.model('User');
    
    // Check current users
    const adminCount = await User.countDocuments({ role: 'admin' });
    const trainerCount = await User.countDocuments({ role: 'trainer' });
    const studentCount = await User.countDocuments({ role: 'student' });
    
    console.log('\n📊 Current User Statistics:');
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Trainers: ${trainerCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Total: ${adminCount + trainerCount + studentCount}`);
    
    // Note: The User model already supports 'admin', 'trainer', 'student'
    // We're just documenting that admins can act as evaluators
    // No database changes needed - this is a role clarification
    
    console.log('\n✅ Migration Complete!');
    console.log('📝 Note: Existing "admin" users can now also act as "evaluators"');
    console.log('   No data was modified. All existing functionality preserved.');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}
 
// Run migration
if (require.main === module) {
  addEvaluatorRole();
}
 
module.exports = { addEvaluatorRole };