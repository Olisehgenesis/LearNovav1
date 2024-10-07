import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getQuizzes } from "../lib/db";
import { Link } from "react-router-dom";

interface Reward {
  reward_name: string;
  amount: number;
}

interface Quest {
  id: number;
  name: string;
  questions: string;
  num_questions: number;
  required_pass_score: number;
  rewards: Reward[];
  start_date: string;
  end_date: string;
  cover_image_url: string;
  created_at: string;
}

function QuestBrowser() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const fetchedQuizzes = await getQuizzes();
        setQuests(fetchedQuizzes);
      } catch (error) {
        console.error("Error fetching quests:", error);
        setError("Failed to load quests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuests();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-8">Loading quests...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">{error}</div>;
  }

  const calculateTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const difference = end.getTime() - now.getTime();

    if (difference <= 0) {
      return "Quest ended";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-8 text-indigo-700"
      >
        Quest Browser
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map((quest) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <img
              src={
                quest.cover_image_url ||
                "https://via.placeholder.com/300x150?text=Quest+Image"
              }
              alt={quest.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2">{quest.name}</h2>
              <p className="text-gray-600 mb-2">
                {quest.num_questions} questions
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Pass score: {quest.required_pass_score}%
              </p>
              <div className="mb-2">
                <h3 className="font-semibold text-indigo-600">Rewards:</h3>
                <ul>
                  {quest.rewards.map((reward, index) => (
                    <li key={index} className="text-sm">
                      {reward.amount} {reward.reward_name}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm font-semibold text-green-600">
                {calculateTimeRemaining(quest.end_date)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(quest.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-indigo-50 p-4">
              <Link
                to={`/attempt-quiz/${quest.id}`}
                className="block w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                Start Quest
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default QuestBrowser;
