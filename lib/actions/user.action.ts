"use server";

import Question from "@/database/question.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from "./shared.types";

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

export async function createUser(userData: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    await connectToDatabase();
    const { clerkId, updateData, path } = params;
    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    await connectToDatabase();
    const { clerkId } = params;

    // const userFound = await User.findOneAndDelete({ clerkId });

    const userFound = await User.findOne({ clerkId });

    if (!userFound) {
      throw new Error("User not found!");
    }

    // ! if use exists then, we have to delete everything [questions, answers, comments, etc] that user has done.
    // * get user question ids
    // eslint-disable-next-line no-unused-vars
    const userQuestionIds = await Question.find({
      author: userFound._id,
    }).distinct("_id");

    // ! delete user questions
    await Question.deleteMany({ author: userFound._id });

    // TODO: delete user answers, comments and more.

    const deletedUser = await User.findByIdAndDelete(userFound._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
