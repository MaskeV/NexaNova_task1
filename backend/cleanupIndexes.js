// Script to clean up orphaned indexes in MongoDB
require('dotenv').config();
const mongoose = require('mongoose');

const cleanupIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get the subjects collection
    const subjectsCollection = db.collection('subjects');
    
    // List all indexes
    const indexes = await subjectsCollection.indexes();
    console.log('📋 Current indexes:', indexes);
    
    // Drop the problematic 'key_1' index if it exists
    try {
      await subjectsCollection.dropIndex('key_1');
      console.log('✅ Dropped orphaned index: key_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Index key_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }
    
    // List indexes again to verify
    const updatedIndexes = await subjectsCollection.indexes();
    console.log('📋 Updated indexes:', updatedIndexes);
    
    console.log('✅ Index cleanup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupIndexes();