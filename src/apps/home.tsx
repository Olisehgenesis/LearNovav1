import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getQuizzes } from "../lib/db";
import {
  ChevronRightIcon,
  StarIcon,
  UserGroupIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";

interface Reward {
  reward_name: string;
  amount: number;
}

interface Quest {
  id?: number;
  blockId?: string;
  name?: string;
  questions?: string;
  num_questions?: number;
  required_pass_score?: number;
  rewards?: Reward[];
  start_date?: string;
  end_date?: string;
  cover_image_url?: string;
  created_at?: string;
  takerCount?: number;
  winnerCount?: number;
  active?: boolean;
  total_rewards?: number;
  reward_count?: number;
}

interface ParsedQuestion {
  id: number;
  text: string;
  options: string[];
}

function Home() {
  const navigate = useNavigate();
  const [featuredQuest, setFeaturedQuest] = useState<Quest | null>(null);
  const [trendingQuests, setTrendingQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const quizzes: Quest[] = await getQuizzes();
        const sortedQuizzes = quizzes.sort(
          (a, b) => (b.takerCount || 0) - (a.takerCount || 0)
        );
        setFeaturedQuest(sortedQuizzes[0] || null);
        setTrendingQuests(sortedQuizzes.slice(1, 4));
      } catch (error) {
        console.error("Error fetching quests:", error);
      }
    };

    fetchQuests();
  }, []);

  const formatQuestions = (questions: string | undefined): ParsedQuestion[] => {
    if (!questions) return [];
    try {
      const parsedQuestions = JSON.parse(questions);
      if (Array.isArray(parsedQuestions)) {
        return parsedQuestions.map((q: any) => ({
          id: q.id,
          text: q.text.replace(/^\*\*Question \d+:\*\*\s*/, ""),
          options: q.options.slice(1), // Remove the question text from options
        }));
      }
    } catch (error) {
      console.error("Error parsing questions:", error);
    }
    return [];
  };

  const renderQuestion = (question: ParsedQuestion) => {
    console.log("Rendering question:", question); // Add this line
    if (!question || typeof question !== "object") {
      console.error("Invalid question object:", question);
      return null;
    }
    return (
      <>
        <div key={question.id} className="mb-4">
          <p className="font-semibold">{question.text}</p>
          <ul className="list-disc pl-5 mt-2">
            {Array.isArray(question.options) ? (
              question.options.map((option, index) => (
                <li key={index}>{option}</li>
              ))
            ) : (
              <li>No options available</li>
            )}
          </ul>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-orange-600 mb-4">
            Embark on Your Learning Quest
          </h1>
          <p className="text-xl text-green-700">
            Conquer challenges, earn rewards, and level up your knowledge
          </p>
        </motion.div>

        {featuredQuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden mb-12"
          >
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img
                  className="h-64 w-full object-cover md:w-64"
                  src={
                    featuredQuest.cover_image_url ||
                    "https://via.placeholder.com/256x256.png?text=Featured+Quest"
                  }
                  alt={featuredQuest.name}
                />
              </div>
              <div className="p-8 flex-grow">
                <div className="uppercase tracking-wide text-sm text-green-500 font-semibold">
                  Featured Quest
                </div>
                <h2 className="mt-1 text-2xl font-bold text-orange-600">
                  {featuredQuest.name}
                </h2>
                <div className="mt-4 text-gray-600"></div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 text-green-500 mr-1" />
                      {featuredQuest.takerCount} Questers
                    </span>
                    <span className="flex items-center">
                      <TrophyIcon className="h-5 w-5 text-orange-500 mr-1" />
                      {featuredQuest.winnerCount} Champions
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/attempt-quiz/${featuredQuest.id}`)
                    }
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Start Quest
                    <ChevronRightIcon
                      className="ml-2 -mr-1 h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-green-700 mb-8">
            Trending Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence>
              {trendingQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    className="h-48 w-full object-cover"
                    src={
                      quest.cover_image_url ||
                      "https://via.placeholder.com/384x192.png?text=Quest+Image"
                    }
                    alt={quest.name}
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-orange-600">
                      {quest.name}
                    </h3>
                    <div className="text-sm text-gray-600 mb-4 h-32 overflow-y-auto">
                      {formatQuestions(quest.questions)
                        .slice(0, 1)
                        .map(renderQuestion)}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {quest.total_rewards?.toFixed(2)} LRN
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/attempt-quiz/${quest.id}`)}
                        className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        View Quest
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate("/quests")}
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Explore All Quests
            <ChevronRightIcon
              className="ml-2 -mr-1 h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
