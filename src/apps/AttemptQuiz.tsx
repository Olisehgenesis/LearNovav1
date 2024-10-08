import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getQuizById, getDocumentById, saveQuizAttempt } from "../lib/db";
import Quiz from "./quest/components/Quiz";
import Results from "./quest/components/Results";

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

    console.log("User Answers:", results.userAnswers);

    if (results.userAnswers) {
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
      console.error("User answers are undefined");
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
          <Results results={quizResults} quizData={quizData} />
        ) : (
          <div className="text-center mt-8">Error loading quiz data.</div>
        )}
      </div>
    </div>
  );
}

export default AttemptQuiz;
