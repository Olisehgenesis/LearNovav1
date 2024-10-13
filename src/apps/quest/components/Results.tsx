import React from "react";
import { useQuizToken } from "../../token/hook/useQuizToken";
import { QuizData } from "./shared-types";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import type {
  TransactionError,
  TransactionResponse,
} from "@coinbase/onchainkit/transaction";
import type { ContractFunctionParameters } from "viem";
import { baseSepolia } from "wagmi/chains";
import QuizFactoryABI from "../../token/contracts/abi/QuizFactoryABI.json";

interface ResultsProps {
  results: {
    score: number;
    feedback: string;
    questionFeedback: Array<{
      id: number;
      correct: boolean;
      feedback: string;
    }>;
    userAnswers: Record<number, string>;
  };
  quizData: QuizData;
  onBackToList: () => void;
}

const Results: React.FC<ResultsProps> = ({
  results,
  quizData,
  onBackToList,
}) => {
  const { userAddress } = useQuizToken();

  const isPassed = results.score >= 80; // You might want to adjust this threshold

  const QUIZ_FACTORY_ADDRESS = "0x2e026c70E43d76aA00040ECD85601fF47917C157";

  const contracts = [
    {
      address: QUIZ_FACTORY_ADDRESS as `0x${string}`,
      abi: QuizFactoryABI,
      functionName: "attemptQuiz",
      args: [BigInt(quizData.blockId ?? 1), true],
    },
  ] as unknown as ContractFunctionParameters[];

  const handleError = (err: TransactionError) => {
    console.error("Transaction error:", err);
    alert("Failed to claim reward. Please try again.");
  };

  const handleSuccess = (response: TransactionResponse) => {
    console.log("Transaction successful", response);
    alert("Congratulations! You've been awarded the reward.");
    window.location.href = "/";
  };

  const handleRetake = () => {
    onBackToList();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-center text-indigo-700">
        Quiz Results
      </h2>
      <p className="text-2xl mb-4 text-center">
        Your score:{" "}
        <span className={isPassed ? "text-green-600" : "text-red-600"}>
          {results.score}%
        </span>
      </p>
      <p className="mb-6 text-center font-semibold">{results.feedback}</p>
      <h3 className="text-xl font-semibold mb-4">Question Feedback:</h3>
      <ul className="space-y-4 mb-8">
        {results.questionFeedback.map((feedback) => (
          <li
            key={feedback.id}
            className={`p-4 rounded-lg ${
              feedback.correct ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <p className={feedback.correct ? "text-green-700" : "text-red-700"}>
              {feedback.feedback}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center">
        {isPassed ? (
          <Transaction
            chainId={baseSepolia.id}
            contracts={contracts}
            onError={handleError}
            onSuccess={handleSuccess}
          >
            <TransactionButton text="Claim Prize"></TransactionButton>
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        ) : (
          <button
            onClick={handleRetake}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Retake Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default Results;
