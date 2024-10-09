import React, { useState } from "react";
import { useQuizToken } from "../../token/hook/useQuizToken";
import { QuizData } from "./shared-types";

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
  const [isAwarding, setIsAwarding] = useState(false);
  const [awardError, setAwardError] = useState<string | null>(null);
  const { attemptQuiz } = useQuizToken();

  // Since we don't have quizData, we'll need to adjust how we determine if the quiz is passed
  const isPassed = results.score >= 70; // You might want to adjust this threshold

  const handleAwardReward = async () => {
    setIsAwarding(true);
    setAwardError(null);
    try {
      const quizId = BigInt(quizData.blockId ?? 1);
      await attemptQuiz(quizId, true);
      alert("Congratulations! You've been awarded the reward.");
    } catch (error) {
      console.error("Error awarding reward:", error);
      setAwardError("Failed to award reward. Please try again.");
    } finally {
      setIsAwarding(false);
    }
  };

  const handleRetake = () => {
    // Instead of navigating, we'll use the onBackToList prop
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
          <button
            onClick={handleAwardReward}
            disabled={isAwarding}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-green-300 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {isAwarding ? "Processing..." : "Claim Prize"}
          </button>
        ) : (
          <button
            onClick={handleRetake}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Retake Quiz
          </button>
        )}
      </div>
      {awardError && (
        <p className="text-red-500 mt-4 text-center">{awardError}</p>
      )}
    </div>
  );
};

export default Results;
