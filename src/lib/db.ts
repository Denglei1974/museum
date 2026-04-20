import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const cache: {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = { connection: null, promise: null };

export default async function dbConnect() {
  if (cache.connection) {
    return cache.connection;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "museum",
    });
  }

  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.connection;
}
