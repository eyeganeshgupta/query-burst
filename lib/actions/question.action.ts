"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { connectToDatabase } from "../mongoose";

export async function createQuestion(params: any) {
  // eslint-disable-next-line no-empty
  try {
    // TODO: connect to dataBase
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // * create a question.
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // * create the tags or get them if they already exists.
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        {
          name: {
            $regex: new RegExp(`^${tag}$`, "i"),
          },
        },
        {
          $setOnInsert: {
            name: tag,
          },
          $push: {
            question: question._id,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      tagDocuments.push(existingTag._id);
    }

    // * update the question
    await Question.findByIdAndUpdate(question._id, {
      $push: {
        tags: {
          $each: tagDocuments,
        },
      },
    });
  } catch (error) {}
}

/*
const dummyUser = {
  clerkId: "1847",
  name: "Ganesh",
  username: "ganesh2003",
  email: "ganeshgupta9762@dump.com",
  password: "ganesh2003",
  bio: "Full-stack Web Developer",
  picture: "profile.jpg",
  location: "Vasai, Palghar",
  portfolioWebsite: "https://example.com",
  reputation: 100,
  saved: [],
  joinedAt: new Date(),
};
*/
