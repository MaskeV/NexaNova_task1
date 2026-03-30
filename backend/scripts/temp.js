// scripts/dropStaleIndex.js
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/nexanova_dev');
  await mongoose.connection.collection('schedules').dropIndex('scheduleId_1');
  console.log('✅ Dropped stale index: scheduleId_1');
  await mongoose.disconnect();
}

run().catch(console.error);