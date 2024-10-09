import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getQuizById, getDocumentById, saveQuizAttempt } from "../lib/db";
import Quiz from "./quest/components/Quiz";
import Results from "./quest/components/Results";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define a type for the GenAI instance
type GenAIInstance = GoogleGenerativeAI | null;
interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
}

interface QuizData {
  id: number;
  name: string;
  questions: QuizQuestion[];
  required_pass_score: number;
  summary: string;
  document_id: number;
}

interface QuizResults {
  score: number;
  feedback: string;
  questionFeedback: Array<{
    id: number;
    correct: boolean;
    feedback: string;
  }>;
  userAnswers: Record<number, string>;
}

interface AttemptQuizProps {
  genAI: GenAIInstance;
}

function AttemptQuiz({ genAI }: AttemptQuizProps) {
  const { id } = useParams<{ id: string }>();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!id) return;
      try {
        const quiz = await getQuizById(parseInt(id));
        const doc = await getDocumentById(quiz.document_id);

        const formattedQuizData: QuizData = {
          ...quiz,
          questions: JSON.parse(quiz.questions),
          summary: doc.summary,
        };

        setQuizData(formattedQuizData);
        setDocument(doc);
        console.log(document);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const handleQuizCompleted = async (results: QuizResults) => {
    setQuizResults(results);
    setQuizCompleted(true);

    console.log("User Answers:", results.userAnswers);

    if (results.userAnswers && id) {
      try {
        await saveQuizAttempt(
          parseInt(id),
          JSON.stringify(results.userAnswers),
          results.score
        );
      } catch (error) {
        console.error("Error saving quiz attempt:", error);
      }
    } else {
      console.error("User answers are undefined or quiz ID is missing");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading quiz...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-white mb-8 shadow-text"
        >
          LearnNova Quiz Challenge
        </motion.h1>

        {!quizCompleted && quizData ? (
          <Quiz
            quizData={quizData}
            onQuizCompleted={handleQuizCompleted}
            genAI={genAI}
          />
        ) : quizCompleted && quizResults && quizData ? (
          <Results results={quizResults} quizData={quizData} />
        ) : (
          <div className="text-center mt-8">Error loading quiz data.</div>
        )}
      </div>
    </div>
  );
}

export default AttemptQuiz;
