import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilter from "@/components/home/HomeFilter";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import { getQuestions } from "@/lib/actions/question.action";
import { SearchParamsProps } from "@/types";
import Link from "next/link";

/*
const questions = [
  {
    _id: "1",
    title: "Cascading Deletes in Oracle",
    tags: [
      { _id: "1", name: "SQL" },
      { _id: "2", name: "PL/SQL" },
    ],
    author: {
      _id: "1",
      name: "Ganesh Gupta",
      picture: "ganesh-gupta.jpg",
    },
    upvotes: 812,
    views: 10312,
    answers: [],
    createdAt: new Date("2024-02-24T12:00:00.000Z"),
  },
  {
    _id: "2",
    title: "How to center a div?",
    tags: [
      { _id: "1", name: "CSS" },
      { _id: "2", name: "Bootstrap" },
      { _id: "3", name: "Tailwind" },
    ],
    author: {
      _id: "2",
      name: "Sheetal Gupta",
      picture: "sheetal-gupta.jpg",
    },
    upvotes: 889823,
    views: 1752898,
    answers: [],
    createdAt: new Date("2024-02-24T01:00:00.000Z"),
  },
];
*/

export default async function Home({ searchParams }: SearchParamsProps) {
  const result = await getQuestions({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
  });

  // TODO: fetch recommended questions

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        {/* LocalSearchbar */}
        <LocalSearchbar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />

        {/* Filters */}
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      {/* Filter buttons for medium, large, screen devices */}
      <HomeFilter />

      <div className="mt-10 flex w-full flex-col gap-6">
        {/* Looping through question and display question card */}
        {result.questions.length > 0 ? (
          result.questions.map((question) => {
            return (
              <QuestionCard
                key={question._id}
                _id={question._id}
                title={question.title}
                tags={question.tags}
                author={question.author}
                upvotes={question.upvotes}
                views={question.views}
                answers={question.answers}
                createdAt={question.createdAt}
              />
            );
          })
        ) : (
          <NoResult
            title="There's no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
          discussion. Our query could be the next big thing others learn from. Get
          involed! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
}
