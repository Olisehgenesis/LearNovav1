import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Quiz({ quizData, onQuizCompleted, genAI }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (quizData && quizData.questions) {
      const parsedQuestions = Array.isArray(quizData.questions)
        ? quizData.questions
        : typeof quizData.questions === "string"
          ? JSON.parse(quizData.questions)
          : quizData.questions;

      const formattedQuestions = [];

      for (let i = 0; i < parsedQuestions.length; i += 2) {
        const questionObj = parsedQuestions[i];
        const optionsObj = parsedQuestions[i + 1];

        formattedQuestions.push({
          id: questionObj.id,
          text: `Question ${i / 2 + 1}: ${optionsObj.options[0].replace(
            /^t\s/,
            ""
          )}`,
          options: optionsObj.options.slice(1).map((option, index) => ({
            letter: String.fromCharCode(65 + index),
            text: option,
          })),
        });
      }

      setQuestions(formattedQuestions);
    }
  }, [quizData]);

  useEffect(() => {
    if (questions.length > 0) {
      setSelectedOption(answers[questions[currentQuestionIndex].id] || null);
    }
  }, [currentQuestionIndex, answers, questions]);

  if (questions.length === 0) {
    return <div>Loading quiz data...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(`
        Evaluate these answers for the quiz and give a score out of 100:
        Quiz Data: ${JSON.stringify(questions)}
        User Answers: ${JSON.stringify(answers)}
        
        For each question, compare the user's answer to the correct answer.
        Provide a breakdown of correct and incorrect answers, and calculate a final score.
        Format the response as JSON like this:
        {
          "score": 80,
          "feedback": "You got 4 out of 5 questions correct. Great job!",
          "questionFeedback": [
            {
              "id": 1,
              "correct": true,
              "feedback": "Correct! This answer accurately reflects the main point of the text."
            },
            // ... feedback for other questions
          ]
        }
      `);
      const response = await result.response.text();
      const jsonString = response.replace(/```json\s?|\s?```/g, "").trim();
      const parsedResponse = JSON.parse(jsonString);
      onQuizCompleted({ ...parsedResponse, userAnswers: answers });
    } catch (error) {
      console.error("Error submitting answers:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-800">
        LearnNova Quiz Challenge
      </h2>
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="bg-white shadow-lg rounded-lg p-8 mb-6"
      >
        <p className="text-sm text-gray-600 mb-4 italic">{quizData.summary}</p>
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="p-2 rounded-full bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} />
          </motion.button>
          <span className="font-semibold text-lg text-indigo-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={isLastQuestion || !selectedOption}
            className="p-2 rounded-full bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
        <p className="text-xl font-semibold mb-6 text-indigo-900">
          {currentQuestion.text}
        </p>
        <div className="space-y-4">
          <AnimatePresence>
            {currentQuestion.options.map(({ letter, text }) => (
              <motion.button
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(letter)}
                className={`w-full p-4 text-left rounded-lg transition-colors ${
                  selectedOption === letter
                    ? "bg-indigo-500 text-white"
                    : "bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                }`}
              >
                <span className="font-semibold mr-3 text-lg">{letter}.</span>
                {text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
      <div className="flex justify-between items-center">
        <div className="w-full bg-indigo-200 rounded-full h-3">
          <motion.div
            className="bg-indigo-600 h-3 rounded-full"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
        {isLastQuestion && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
            className="ml-6 bg-green-500 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Trophy size={20} className="mr-2" />
                Finish Quiz
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default Quiz;
