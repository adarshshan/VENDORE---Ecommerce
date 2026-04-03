import mongoose from "mongoose";

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  // const uri =
  //   "mongodb+srv://adarshshanu3_db_user:7ExsYD8XjgNgCzFj@usecase-1.sf2vkpy.mongodb.net/?appName=usecase-1";

  console.log("Mongodb uri....");
  console.log(uri);
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  console.log("Attempting to connect to MongoDB with URI:", uri);

  try {
    const connection = await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}
