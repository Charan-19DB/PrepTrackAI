import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/preptrack_ai';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Warning]: ${error.message}`);
    if (uri !== 'mongodb://127.0.0.1:27017/preptrack_ai') {
      try {
        console.log('[MongoDB] Falling back to local MongoDB service at 127.0.0.1:27017...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/preptrack_ai');
        console.log(`[MongoDB Connected to Local] Host: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.error(`[Local MongoDB Error]: ${localErr.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};
