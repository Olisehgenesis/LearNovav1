import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useReadContract, useWriteContract, usePrepareTransactionRequest } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import QuizTokenABI from '../contracts/abi/QuizTokenABI.json';
import QuizFactoryABI from '../contracts/abi/QuizFactoryABI.json';

const QUIZ_TOKEN_ADDRESS = '0xD31b5bED7ba6e427BBc9516041CC8B9B3EC13725';
const QUIZ_FACTORY_ADDRESS = '0xB81c6a996971bE1Ae1246cb921E84a73de67FF94';

export function useQuizToken() {
  const { address: userAddress } = useAccount();
  const [userBalance, setUserBalance] = useState(null);

  // Read user balance
  const { data: balanceData } = useReadContract({
    address: QUIZ_TOKEN_ADDRESS,
    abi: QuizTokenABI,
    functionName: 'balanceOf',
    args: [userAddress],
    chainId: baseSepolia.id,
  });

  useEffect(() => {
    if (balanceData) {
      setUserBalance(ethers.utils.formatEther(balanceData));
    }
  }, [balanceData]);

  // Prepare and execute contract writes
  const { writeContract } = useWriteContract();

  const createQuiz = async (name, tokenReward, takerLimit, startDate, endDate) => {
    try {
      const totalTokens = ethers.utils.parseEther(tokenReward).mul(takerLimit === 0 ? 1000 : takerLimit);
      
      // Approve tokens
      await writeContract({
        address: QUIZ_TOKEN_ADDRESS,
        abi: QuizTokenABI,
        functionName: 'approve',
        args: [QUIZ_FACTORY_ADDRESS, totalTokens],
        chainId: baseSepolia.id,
      });

      // Create quiz
      await writeContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'createQuiz',
        args: [
          name,
          ethers.utils.parseEther(tokenReward),
          takerLimit,
          Math.floor(new Date(startDate).getTime() / 1000),
          Math.floor(new Date(endDate).getTime() / 1000)
        ],
        chainId: baseSepolia.id,
      });

      console.log('Quiz created successfully');
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const attemptQuiz = async (quizId, won) => {
    try {
      await writeContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'attemptQuiz',
        args: [quizId, won],
        chainId: baseSepolia.id,
      });
      console.log('Quiz attempt recorded');
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
    }
  };

  const updateQuiz = async (quizId, newTokenReward, newTakerLimit, newStartDate, newEndDate) => {
    try {
      await writeContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'updateQuiz',
        args: [
          quizId,
          ethers.utils.parseEther(newTokenReward),
          newTakerLimit,
          Math.floor(new Date(newStartDate).getTime() / 1000),
          Math.floor(new Date(newEndDate).getTime() / 1000)
        ],
        chainId: baseSepolia.id,
      });
      console.log('Quiz updated successfully');
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const withdrawRemainingTokens = async (quizId) => {
    try {
      await writeContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'withdrawRemainingTokens',
        args: [quizId],
        chainId: baseSepolia.id,
      });
      console.log('Remaining tokens withdrawn successfully');
    } catch (error) {
      console.error('Error withdrawing remaining tokens:', error);
    }
  };

  const getQuizDetails = async (quizId) => {
    try {
      const quizData = await readContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'quizzes',
        args: [quizId],
        chainId: baseSepolia.id,
      });

      return {
        owner: quizData.owner,
        name: quizData.name,
        tokenReward: ethers.utils.formatEther(quizData.tokenReward),
        totalTokens: ethers.utils.formatEther(quizData.totalTokens),
        takerLimit: quizData.takerLimit.toNumber(),
        takerCount: quizData.takerCount.toNumber(),
        winnerCount: quizData.winnerCount.toNumber(),
        startDate: new Date(quizData.startDate.toNumber() * 1000),
        endDate: new Date(quizData.endDate.toNumber() * 1000),
        active: quizData.active
      };
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      return null;
    }
  };

  return {
    userAddress,
    userBalance,
    createQuiz,
    attemptQuiz,
    updateQuiz,
    withdrawRemainingTokens,
    getQuizDetails
  };
}