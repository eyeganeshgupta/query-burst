import { getUserAnswers } from "@/lib/actions/user.action";
import { SearchParamsProps } from "@/types";
import AnswerCard from "../cards/AnswerCard";
import Pagination from "./Pagination";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null | undefined;
}

const AnswerTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <>
      {result.answers.map((item) => {
        return (
          <AnswerCard
            key={item._id}
            _id={item._id}
            clerkId={clerkId}
            question={item.question}
            author={item.author}
            upvotes={item.upvotes.length}
            createdAt={item.createdAt}
          />
        );
      })}

      {/* Pagination Component */}
      <div className="mt-10">
        <Pagination
          pageNumber={searchParams?.pageNumber ? +searchParams.pageNumber : 1}
          isNext={result?.isNextAnswers}
        />
      </div>
    </>
  );
};

export default AnswerTab;
