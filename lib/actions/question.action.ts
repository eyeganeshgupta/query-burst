"use server";

import { connectToDatabase } from "../mongoose";

export async function createQuestion(params) {
  // eslint-disable-next-line no-empty
  try {
    // TODO: connect to dataBase
    connectToDatabase();
  } catch (error) {}
}
