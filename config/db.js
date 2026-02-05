const mongoose = require('mongoose');

const MONGODB_URI =
  'mongodb+srv://sagealphaai:Alpha123@v5-mongodb.ouebjj5.mongodb.net/sagealpha?retryWrites=true&w=majority&tls=true';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    // For Mongoose 7+, no additional options are required
    await mongoose.connect(MONGODB_URI);

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;
