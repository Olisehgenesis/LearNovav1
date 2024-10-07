import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizPage from "./components/QuizPage";
import Results from "./components/Results";
import QuizCreationPage from "./components/QuizCreationPage";

function QuizzApp({ genAI }) {
  const [stage, setStage] = useState("list");
  const [quizData, setQuizData] = useState(null);
  const [score, setScore] = useState(null);

  const handleFileProcessed = (data) => {
    setQuizData(data);
    setStage("quiz");
  };

  const handleQuizCompleted = (result) => {
    setScore(result);
    setStage("results");
  };

  const handleBackToList = () => {
    setStage("list");
    setQuizData(null);
    setScore(null);
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
                <QuizCreationPage genAI={genAI} />
              </motion.div>
            )}

            {stage === "quiz" && (
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

            {stage === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <Results score={score} onBackToList={handleBackToList} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default QuizzApp;
