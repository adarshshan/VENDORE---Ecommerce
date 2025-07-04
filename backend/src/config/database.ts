import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}
