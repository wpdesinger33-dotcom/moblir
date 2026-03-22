/**
 * MongoDB connection helper.
 *
 * The connection is entirely optional – every page works fine with only
 * Markdown data.  When MONGODB_URI is present the DB is connected once and
 * the connection is cached across hot-reloads in dev.
 */

import mongoose from "mongoose";

declare global {
  var __mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.__mongooseCache) {
  global.__mongooseCache = { conn: null, promise: null };
}

const cache = global.__mongooseCache;

/** Connect to MongoDB and return the mongoose instance, or null if unconfigured. */
export async function connectDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m)
      .catch((err) => {
        cache.promise = null;
        console.error("[MongoDB] Connection failed:", err.message);
        throw err;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch {
    return null;
  }
  return cache.conn;
}

/** True when MONGODB_URI is set in environment. */
export function isDBConfigured(): boolean {
  return !!process.env.MONGODB_URI;
}
