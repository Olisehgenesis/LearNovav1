import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getQuizById, getDocumentById, saveQuizAttempt } from "../lib/db";
import Quiz from "./quest/components/Quiz";

function AttemptQuiz({ genAI }) {
  const { id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quiz = await getQuizById(parseInt(id));
        const doc = await getDocumentById(quiz.document_id);

        // Ensure the quiz data is in the correct format
        const formattedQuizData = {
          ...quiz,
          questions: JSON.parse(quiz.questions),
          summary: doc.summary,
        };

        setQuizData(formattedQuizData);
        setDocument(doc);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const handleQuizCompleted = async (results) => {
    setQuizResults(results);
    setQuizCompleted(true);

    try {
      await saveQuizAttempt(
        parseInt(id),
        JSON.stringify(results.userAnswers),
        results.score
      );
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
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
        ) : quizCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-indigo-800 mb-4">
              Quiz Results
            </h2>
            <p className="text-2xl font-semibold text-indigo-600 mb-4">
              Your Score: {quizResults.score}%
            </p>
            <p className="text-lg text-gray-700 mb-6">{quizResults.feedback}</p>
            <h3 className="text-xl font-bold text-indigo-800 mb-3">
              Question Breakdown:
            </h3>
            {quizResults.questionFeedback.map((feedback, index) => (
              <div key={index} className="mb-4 p-4 bg-indigo-50 rounded-lg">
                <p className="font-semibold text-indigo-700">
                  Question {index + 1}:{" "}
                  {feedback.correct ? "Correct" : "Incorrect"}
                </p>
                <p className="text-gray-600">{feedback.feedback}</p>
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/quests")}
              className="mt-6 bg-indigo-500 text-white px-6 py-3 rounded-lg"
            >
              Back to Quest Browser
            </motion.button>
          </motion.div>
        ) : (
          <div className="text-center mt-8">Error loading quiz data.</div>
        )}
      </div>
    </div>
  );
}

export default AttemptQuiz;
