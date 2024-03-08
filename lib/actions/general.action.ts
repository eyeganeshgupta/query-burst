"use server";

import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";

const SearchableTypes = ["question", "answer", "tag", "user"];

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();

    const { query, type } = params;

    const regExQuery = {
      $regex: query,
      $options: "i",
    };

    let results = [];

    const modelsAndTypes = [
      {
        model: Question,
        searchField: "title",
        type: "question",
      },
      {
        model: User,
        searchField: "name",
        type: "user",
      },
      {
        model: Answer,
        searchField: "content",
        type: "answer",
      },
      {
        model: Tag,
        searchField: "name",
        type: "tag",
      },
    ];

    const typeLower = type?.toLowerCase();

    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // ! Search across everything
      // * NO async/await in forEach, map or other iterative methods instead use for...of -> https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop

      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResults = await model
          .find({
            [searchField]: regExQuery,
          })
          .limit(2);

        results.push(
          ...queryResults.map((item) => {
            return {
              title:
                type === "answer"
                  ? `Answers containing ${query}`
                  : item[searchField],
              type,
              id:
                type === "user"
                  ? item.clerkId
                  : type === "answer"
                    ? item.question
                    : item._id,
            };
          })
        );
      }
    } else {
      // ! Search in the specified model type
      const modelInfo = modelsAndTypes.find((item) => {
        return item.type === type;
      });

      if (!modelInfo) {
        throw new Error("invalid search type");
      }

      const queryResults = await modelInfo.model
        .find({
          [modelInfo.searchField]: regExQuery,
        })
        .limit(8);

      results = queryResults.map((item) => {
        return {
          title:
            type === "answer"
              ? `Answers containing ${query}`
              : item[modelInfo.searchField],
          type,
          id:
            type === "user"
              ? item.clerkId
              : type === "answer"
                ? item.question
                : item._id,
        };
      });
    }
    return JSON.stringify(results);
  } catch (error) {
    console.log(`Error fetching global results, ${error}`);
    throw error;
  }
}
