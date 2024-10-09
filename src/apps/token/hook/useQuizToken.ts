import { useState, useEffect } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { account, publicClient, walletClient } from './client';
import { formatEther, parseEther , decodeEventLog} from 'viem';
import QuizTokenABI from '../contracts/abi/QuizTokenABI.json';
import QuizFactoryABI from '../contracts/abi/QuizFactoryABI.json';

const QUIZ_TOKEN_ADDRESS = '0x270B4190DD62De9fbb48Cd71C6B052f5924d4FcC';
const QUIZ_FACTORY_ADDRESS = '0x2e026c70E43d76aA00040ECD85601fF47917C157';

export function useQuizToken() {
  const { address: userAddress } = useAccount();
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const { data: ensName } = useEnsName({ address: userAddress });

  useEffect(() => {
    const fetchBalance = async () => {
      if (userAddress) {
        try {
          const balanceData = await publicClient.readContract({
            address: QUIZ_TOKEN_ADDRESS,
            abi: QuizTokenABI,
            functionName: 'balanceOf',
            args: [userAddress],
          }) as bigint;
          setUserBalance(formatEther(balanceData));
        } catch (error) {
          console.error('Error fetching balance:', error);
          setUserBalance(null);
        }
      }
    };

    fetchBalance();
  }, [userAddress]);



const createQuiz = async (
  name: string,
  tokenReward: string,
  takerLimit: number,
  startDate: string | Date,
  endDate: string | Date
): Promise<number> => {
  try {
    const startDateTime = startDate instanceof Date ? startDate : new Date(startDate);
    const endDateTime = endDate instanceof Date ? endDate : new Date(endDate);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new Error('Invalid start or end date');
    }

    const startTimestamp = BigInt(Math.floor(startDateTime.getTime() / 1000));
    const endTimestamp = BigInt(Math.floor(endDateTime.getTime() / 1000));

    console.log("Start Date:", startDateTime.toISOString());
    console.log("End Date:", endDateTime.toISOString());
    console.log("Start Timestamp:", startTimestamp.toString());
    console.log("End Timestamp:", endTimestamp.toString());
    console.log("Token Reward:", tokenReward);
    console.log("Taker Limit:", takerLimit);

    const totalTokens = parseEther(tokenReward) * BigInt(takerLimit === 0 ? 1000 : takerLimit);
    console.log("Total Tokens:", totalTokens.toString());

    // Approve tokens
    const approveResult = await walletClient.writeContract({
      account: await account(),
      address: QUIZ_TOKEN_ADDRESS,
      abi: QuizTokenABI,
      functionName: 'approve',
      args: [QUIZ_FACTORY_ADDRESS, totalTokens],
    });

    // Wait for the approval transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash: approveResult });

    console.log("Tokens approved successfully");

    // Create quiz
    const { request } = await publicClient.simulateContract({
      address: QUIZ_FACTORY_ADDRESS,
      abi: QuizFactoryABI,
      functionName: 'createQuiz',
      args: [
        name,
        parseEther(tokenReward),
        BigInt(takerLimit),
        startTimestamp,
        endTimestamp,
      ],
      account: await account(),
    });
    
    const createResult = await walletClient.writeContract(request);
    console.log('Quiz creation transaction sent:', createResult);

    // Wait for the transaction to be mined and get the receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash: createResult });
    console.log('Quiz creation transaction mined:', receipt);

    // Log all events for debugging
    console.log('All logs:', receipt.logs);

    // Find the QuizCreated event in the logs
    const quizCreatedEvent = receipt.logs.find((log) => {
      try {
        const decodedLog = decodeEventLog({
          abi: QuizFactoryABI,
          data: log.data,
          topics: log.topics,
        });
        return decodedLog.eventName === 'QuizCreated';
      } catch {
        return false;
      }
    });

    if (!quizCreatedEvent) {
      console.warn('QuizCreated event not found in transaction logs');
 throw new Error('QuizCreated event not found in transaction logs');
      return 0;
    }

    // Decode the event log to get the quizId
    const decodedEvent = decodeEventLog({
      abi: QuizFactoryABI,
      data: quizCreatedEvent.data,
      topics: quizCreatedEvent.topics,
    });
    if (!decodedEvent || !decodedEvent.args) {
      throw new Error('Failed to decode QuizCreated event');
    }
    if (decodedEvent.args && typeof decodedEvent.args === 'object' && 'quizId' in decodedEvent.args) {
      const quizId = Number(decodedEvent.args.quizId);
      console.log('New Quiz ID:', quizId.toString());
      return quizId;
    } else {
      throw new Error('Failed to decode QuizCreated event: quizId not found');
    }

  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

  const attemptQuiz = async (quizId: bigint, won: boolean) => {
    try {
      const { request } = await publicClient.simulateContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'attemptQuiz',
        args: [quizId, won],
        account: await account(),
      });

      const result = await walletClient.writeContract(request);
      console.log('Quiz attempt recorded, transaction:', result);
      return result;
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
      throw error;
    }
  };

  const updateQuiz = async (quizId: bigint, newTokenReward: string, newTakerLimit: number, newStartDate: Date, newEndDate: Date) => {
    try {
      const { request } = await publicClient.simulateContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'updateQuiz',
        args: [
          quizId,
          parseEther(newTokenReward),
          BigInt(newTakerLimit),
          BigInt(Math.floor(newStartDate.getTime() / 1000)),
          BigInt(Math.floor(newEndDate.getTime() / 1000))
        ],
        account: await account(),
      });

      const result = await walletClient.writeContract(request);
      console.log('Quiz updated successfully, transaction:', result);
      return result;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  };

  const withdrawRemainingTokens = async (quizId: bigint) => {
    try {
      const { request } = await publicClient.simulateContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'withdrawRemainingTokens',
        args: [quizId],
        account: await account(),
      });

      const result = await walletClient.writeContract(request);
      console.log('Remaining tokens withdrawn successfully, transaction:', result);
      return result;
    } catch (error) {
      console.error('Error withdrawing remaining tokens:', error);
      throw error;
    }
  };

  const getQuizDetails = async (quizId: bigint) => {
    try {
      const quizData = await publicClient.readContract({
        address: QUIZ_FACTORY_ADDRESS,
        abi: QuizFactoryABI,
        functionName: 'quizzes',
        args: [quizId],
      }) as [string, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, boolean];

      return {
        owner: quizData[0],
        name: quizData[1],
        tokenReward: formatEther(quizData[2]),
        totalTokens: formatEther(quizData[3]),
        takerLimit: Number(quizData[4]),
        takerCount: Number(quizData[5]),
        winnerCount: Number(quizData[6]),
        startDate: new Date(Number(quizData[7]) * 1000),
        endDate: new Date(Number(quizData[8]) * 1000),
        active: quizData[9]
      };
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      return null;
    }
  };

  return {
    ensName,
    userAddress,
    userBalance,
    createQuiz,
    attemptQuiz,
    updateQuiz,
    withdrawRemainingTokens,
    getQuizDetails
  };
}