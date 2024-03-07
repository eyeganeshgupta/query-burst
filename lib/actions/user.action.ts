"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";

import Answer from "@/database/answer.model";
import { FilterQuery } from "mongoose";

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

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();
    // eslint-disable-next-line no-unused-vars
    const { page = 1, pageSize = 20, filter, searchQuery } = params;

    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        {
          name: {
            $regex: new RegExp(searchQuery, "i"),
          },
        },
        {
          username: {
            $regex: new RegExp(searchQuery, "i"),
          },
        },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "new_users":
        sortOptions = {
          joinedAt: -1,
        };
        break;
      case "old_users":
        sortOptions = {
          joinedAt: 1,
        };
        break;
      case "top_contributors":
        sortOptions = {
          reputation: -1,
        };
        break;
      default:
        sortOptions = {
          joinedAt: -1,
        };
        break;
    }

    const users = await User.find(query).sort(sortOptions);
    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();
    // eslint-disable-next-line no-unused-vars
    const { clerkId, page = 1, pageSize = 10, filter, searchQuery } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? {
          title: {
            $regex: new RegExp(searchQuery, "i"),
          },
        }
      : {};

    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = {
          createdAt: -1,
        };
        break;
      case "oldest":
        sortOptions = {
          createdAt: 1,
        };
        break;
      case "most_voted":
        sortOptions = {
          upvotes: -1,
        };
        break;
      case "most_viewed":
        sortOptions = {
          reputation: -1,
        };
        break;
      case "most_answered":
        sortOptions = {
          views: -1,
        };
        break;
      default:
        sortOptions = {
          createdAt: -1,
        };
    }

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
      },
      populate: [
        {
          path: "tags",
          model: Tag,
          select: "_id name",
        },
        {
          path: "author",
          model: User,
          select: "_id clerkId name picture",
        },
      ],
    });

    if (!user) {
      throw new Error("User not found!");
    }

    const savedQuestions = user.saved;

    return { questions: savedQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    // eslint-disable-next-line no-unused-vars
    const { userId, page = 1, pageSize = 10 } = params;

    const totalQuestions = await Question.countDocuments({
      author: userId,
    });

    const userQuestions = await Question.find({
      author: userId,
    })
      .sort({
        views: -1,
        upvotes: -1,
      })
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    return { totalQuestions, questions: userQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    // eslint-disable-next-line no-unused-vars
    const { userId, page = 1, pageSize = 10 } = params;

    const totalAnswers = await Answer.countDocuments({
      author: userId,
    });

    const userAnswers = await Answer.find({
      author: userId,
    })
      .sort({
        upvotes: -1,
      })
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");

    return { totalAnswers, answers: userAnswers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found!");
    }

    const totalQuestions = await Question.countDocuments({
      author: user._id,
    });

    const totalAnswers = await Answer.countDocuments({
      author: user._id,
    });

    return {
      user,
      totalQuestions,
      totalAnswers,
    };
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

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();
    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found!");
    }

    const isQuestionSaved = user.saved.includes(questionId);
    if (isQuestionSaved) {
      // ! remove question from saved
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            saved: questionId,
          },
        },
        {
          new: true,
        }
      );
    } else {
      // ! add question to saved
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            saved: questionId,
          },
        },
        {
          new: true,
        }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
