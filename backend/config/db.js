import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillforge_ai';
  
  const connectionOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  try {
    const conn = await mongoose.connect(primaryUri, connectionOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-migrate legacy settings.theme values ('system' or invalid) to 'dark'
    mongoose.model('User').updateMany(
      { 'settings.theme': { $nin: ['light', 'dark'] } },
      { $set: { 'settings.theme': 'dark' } }
    ).catch(err => console.error('Error auto-migrating legacy theme settings:', err));
  } catch (error) {
    console.error(`MongoDB Connection Error (${primaryUri}): ${error.message}`);
    
    // If Atlas times out, attempt local fallback if available
    if (primaryUri.includes('mongodb.net')) {
      console.log('Attempting connection to local MongoDB fallback...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/skillforge_ai', connectionOptions);
        console.log(`✅ Local MongoDB Fallback Connected: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.warn('Local MongoDB fallback unavailable. Running with offline resilience.');
      }
    }
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB Connection Event Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Socket disconnected.');
});

export default connectDB;
