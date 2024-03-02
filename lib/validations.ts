import { z } from "zod";

export const QuestionsSchema = z.object({
  title: z.string().min(5).max(150),
  explanation: z.string().min(20),
  tags: z.array(z.string().min(1).max(30)).min(1).max(3),
});

export const AnswerSchema = z.object({
  answer: z.string().min(20),
});
