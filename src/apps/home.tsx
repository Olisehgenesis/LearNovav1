import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getQuizzes } from "../lib/db";

interface Quest {
  id: number;
  questions: string;
  total_rewards_tokens: number;
  created_at: string;
}

function Home() {
  const navigate = useNavigate();
  const [trendingQuests, setTrendingQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const quizzes = await getQuizzes();
        // Sort quizzes by creation date and take the latest 3
        const sortedQuizzes = quizzes
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 3);
        setTrendingQuests(sortedQuizzes);
      } catch (error) {
        console.error("Error fetching quests:", error);
      }
    };

    fetchQuests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-8 text-indigo-700"
      >
        Welcome to LearNova
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-center mb-8"
      >
        AI-Powered Learning, Blockchain-Backed Rewards
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">Why LearNova?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>AI-generated quizzes tailored to your learning needs</li>
          <li>Earn tokens for completing quests and demonstrating knowledge</li>
          <li>Blockchain-powered certificates for verifiable achievements</li>
          <li>Community-driven quest creation and curation</li>
          <li>Learn, earn, and grow in the world of Web3 and beyond</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Trending Quests</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingQuests.map((quest) => (
            <div
              key={quest.id}
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold mb-2">Quest #{quest.id}</h3>
              <p className="text-sm text-gray-600">
                Earn {quest.total_rewards_tokens} LRN Tokens
                {/* Earn {quest.total_rewards_tokens.toFixed(2)} LRN Tokens */}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(quest.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <button
          onClick={() => navigate("/quests")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Explore All Quests
        </button>
      </motion.div>
    </div>
  );
}

export default Home;
