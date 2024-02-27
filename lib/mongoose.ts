import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    console.log("Missing MongoDB URL");
    return;
  }

  if (isConnected) {
    console.log("Connection is already established");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "query-burst",
    });

    isConnected = true;

    console.log("MongoDB Connection Established and Ready to Use.");
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
