"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetTopInteractedTagsParams } from "./shared.types";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();

    // eslint-disable-next-line no-unused-vars
    const { userId, limit = 3 } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found!");
    }

    // ! find interactions for the user and group by tags.

    return [
      {
        _id: "1",
        name: "JavaScript",
      },
      {
        _id: "2",
        name: "React",
      },
      {
        _id: "3",
        name: "Node",
      },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}
