import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillforge_ai');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash the application during local verification in case MongoDB is not running locally.
    console.log('Continuing without database connection...');
  }
};

export default connectDB;
