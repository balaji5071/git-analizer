import mongoose from "mongoose";

import { secrets } from "@/lib/env";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const globalCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(secrets.mongoUri(), {
      bufferCommands: false,
    });
  }

  globalCache.conn = await globalCache.promise;
  globalThis.mongooseCache = globalCache;

  return globalCache.conn;
}
