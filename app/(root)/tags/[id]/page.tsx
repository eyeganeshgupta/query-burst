import QuestionCard from "@/components/cards/QuestionCard";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { getQuestionsByTagId } from "@/lib/actions/tag.action";
import { URLProps } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questions specific to tag | Query Burst",
};

const TagDetail = async ({ params, searchParams }: URLProps) => {
  const result = await getQuestionsByTagId({
    tagId: params.id,
    page: searchParams.page ? +searchParams.page : 1,
    searchQuery: searchParams.q,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">{result.tagTitle}</h1>

      <div className="mt-11 w-full">
        {/* LocalSearchbar */}
        <LocalSearchbar
          route={`/tags/${params.id}`}
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search tag questions"
          otherClasses="flex-1"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {/* Looping through question and display question card */}
        {result.questions.length > 0 ? (
          result.questions.map((question: any) => {
            // console.log(question);
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
            title="There's no tag question's to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
      discussion. Our query could be the next big thing others learn from. Get
      involed! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>

      {/* Pagination Component */}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.pageNumber ? +searchParams.pageNumber : 1}
          isNext={result?.isNext}
        />
      </div>
    </>
  );
};

export default TagDetail;
