import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getQuizzes } from "../lib/db";
import { Link } from "react-router-dom";
import { useQuizToken } from "./token/hook/useQuizToken";
import { Trophy, Users, Clock, ArrowRight, Book } from "lucide-react";

interface Reward {
  reward_name: string;
  amount: number;
}

interface Quest {
  id: number;
  blockId: string;
  name: string;
  questions: string;
  num_questions: number;
  required_pass_score: number;
  rewards: Reward[];
  start_date: string;
  end_date: string;
  cover_image_url: string;
  created_at: string;
  takerCount: number;
  winnerCount: number;
  active: boolean;
  total_rewards: number;
  reward_count: number;
}

function QuestBrowser() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getQuizDetails } = useQuizToken();

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const fetchedQuizzes = await getQuizzes();
        const updatedQuizzes = await Promise.all(
          fetchedQuizzes.map(async (quiz): Promise<Quest | null> => {
            const onChainDetails = await getQuizDetails(BigInt(quiz.blockId));
            if (onChainDetails === null) {
              console.warn(
                `Failed to fetch on-chain details for quiz ${quiz.blockId}`
              );
              return null;
            }
            return {
              ...quiz,
              takerCount: onChainDetails.takerCount,
              winnerCount: onChainDetails.winnerCount,
              active: true,
            };
          })
        );
        setQuests(
          updatedQuizzes.filter((quiz): quiz is Quest => quiz !== null)
        );
      } catch (error) {
        console.error("Error fetching quests:", error);
        setError("Failed to load quests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuests();
  }, [getQuizDetails]);

  const getQuestStatus = (endDate: string, active: boolean) => {
    const end = new Date(endDate);
    const now = new Date();
    const difference = end.getTime() - now.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const timeString = `${days}d ${hours}h ${difference > 0 ? "remaining" : "overdue"}`;

    return {
      status: active && difference > 0 ? "Active" : "Ended",
      timeRemaining: timeString,
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600 text-xl">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-extrabold text-center mb-12 text-indigo-700 tracking-tight"
      >
        Epic Quest Browser
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {quests.map((quest, index) => {
          const { status, timeRemaining } = getQuestStatus(
            quest.end_date,
            quest.active
          );
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48">
                <img
                  src={quest.cover_image_url || "/api/placeholder/400/200"}
                  alt={quest.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/400/200";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16"></div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4 truncate">
                  {quest.name}
                </h2>

                <div className="flex justify-between items-center mb-4">
                  <span className="flex items-center text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                    <Book size={14} className="mr-1" />
                    {quest.num_questions} questions
                  </span>
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    Pass: {quest.required_pass_score}%
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-indigo-700 mb-2">
                    Rewards:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {quest.rewards.map((reward, index) => (
                      <span
                        key={index}
                        className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded"
                      >
                        {reward.amount} {reward.reward_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{quest.takerCount} attempts</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy size={16} className="mr-1" />
                    <span>{quest.winnerCount} winners</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-orange-500">
                    <Clock size={16} className="mr-1" />
                    <span className="text-sm font-medium">{timeRemaining}</span>
                  </div>
                  {status === "Active" ? (
                    <Link
                      to={`/attempt-quiz/${quest.id}`}
                      className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start Quest <ArrowRight size={16} className="ml-2" />
                    </Link>
                  ) : (
                    <span className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed">
                      Quest Ended
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default QuestBrowser;
