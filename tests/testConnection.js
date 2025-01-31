require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB.');
    await mongoose.connection.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection(); 