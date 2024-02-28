"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";

export async function getUserById(params: any) {
  try {
    await connectToDatabase();

    const { userId } = params;

    const userFound = await User.findOne({ clerkId: userId });

    return userFound;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
