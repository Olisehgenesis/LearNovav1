import { motion } from "framer-motion";
import Quiz from "./Quiz";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizData, QuizResults } from "./shared-types";

interface QuizPageProps {
  quizData: QuizData;
  genAI: GoogleGenerativeAI;
  onQuizCompleted: (results: QuizResults) => void;
}

function QuizPage({ quizData, genAI, onQuizCompleted }: QuizPageProps) {
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

        <Quiz
          quizData={quizData}
          onQuizCompleted={onQuizCompleted}
          genAI={genAI}
        />
      </div>
    </div>
  );
}

export default QuizPage;
