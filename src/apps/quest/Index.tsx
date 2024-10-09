import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizPage from "./components/QuizPage";
import Results from "./components/Results";
import QuizCreationPage from "./components/QuizCreationPage";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define a type for the GenAI instance
interface QuizzAppProps {
  genAI: GoogleGenerativeAI;
}

interface QuizQuestion {
  id: number;
  text: string;
  options: Array<{
    letter: string;
    text: string;
  }>;
}

interface QuizData {
  questions: string | QuizQuestion[];
  summary: string;
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

function QuizzApp({ genAI }: QuizzAppProps) {
  const [stage, setStage] = useState<"list" | "quiz" | "results">("list");
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  const handleQuizCompleted = (results: QuizResults) => {
    setQuizResults(results);
    setStage("results");
  };

  const handleBackToList = () => {
    setStage("list");
    setQuizData(null);
    setQuizResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-orange-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-green-800 mb-8"
        >
          LearnNova Quiz Challenge
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {stage === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <QuizCreationPage
                  genAI={genAI}
                  onQuizCreated={(newQuizData) => {
                    setQuizData(newQuizData);
                    setStage("quiz");
                  }}
                />
              </motion.div>
            )}

            {stage === "quiz" && quizData && genAI && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <QuizPage
                  quizData={quizData}
                  genAI={genAI}
                  onQuizCompleted={handleQuizCompleted}
                />
              </motion.div>
            )}

            {stage === "results" && quizResults && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <Results
                  results={quizResults}
                  onBackToList={handleBackToList}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default QuizzApp;
