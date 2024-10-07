import { useState, useEffect } from 'react';
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { ethers6Adapter } from 'thirdweb/adapters/ethers6';
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from 'thirdweb/chains';
import client from '../../../lib/client';
import {ethers} from 'ethers';
import QuizTokenABI from '../contracts/abi/QuizTokenABI.json';
import QuizFactoryABI from '../contracts/abi/QuizFactoryABI.json';


const baseSepolia = defineChain({
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpc: ['https://rpc.sepolia.org'],
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
});

const QUIZ_TOKEN_ADDRESS = '0xD31b5bED7ba6e427BBc9516041CC8B9B3EC13725';
const QUIZ_FACTORY_ADDRESS = '0xB81c6a996971bE1Ae1246cb921E84a73de67FF94';

export function useQuizToken() {
  const account = useActiveAccount();
  const [userAddress, setUserAddress] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [quizTokenContract, setQuizTokenContract] = useState(null);
  const [quizFactoryContract, setQuizFactoryContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      const chain = baseSepolia || { rpc: [] };

      if (account) {
        try {
          const signer = await ethers5Adapter.signer.toEthers({ account });
          console.log("signer",signer)
          const address = await signer.getAddress();
          console.log("address",address)
          setUserAddress(address);
          console.log("baseSepolia", baseSepolia); // Check if it's defined
        if (!baseSepolia) {
          throw new Error("baseSepolia is undefined");
        }
          const thirdWebFactoryContract =  getContract({
            client,
           chain:baseSepolia,
             address:QUIZ_FACTORY_ADDRESS,
              abi:QuizFactoryABI});
          console.log("thirdWebFactoryContract",thirdWebFactoryContract)
          const factoryContract = await ethers5Adapter.contract.toEthers({
            thirdWebFactoryContract,
          });
          console.log("factoryContract",factoryContract)
          
          const tokenThirdContract = getContract({
            client,
            chain:baseSepolia, 
            address:QUIZ_TOKEN_ADDRESS,
            abi: QuizTokenABI});

          const tokenContract = await ethers5Adapter.contract.toEthers({
            tokenThirdContract,
          });

          
         console.log('Contrac ts initialized successfully');
          console.log(tokenContract, factoryContract);
          console.log('Factory Contract states',factoryContract)

          setQuizTokenContract(tokenContract);
          setQuizFactoryContract(factoryContract);

          const balance = await tokenContract.balanceOf(address);
          setUserBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error('Failed to initialize contracts:', error);
        }
      }
    };

    init();
  }, [account]);

  const createQuiz = async (name, tokenReward, takerLimit, startDate, endDate) => {
    console.log("Factory Contract states",quizFactoryContract)
    console.log("creating Quiz")
    if (!quizFactoryContract)
       return;
    console.log("Factory Contract defined",quizFactoryContract)
    try {
      const totalTokens = ethers.utils.parseEther(tokenReward).mul(takerLimit === 0 ? 1000 : takerLimit);
      await quizTokenContract.approve(QUIZ_FACTORY_ADDRESS, totalTokens);
      const tx = await quizFactoryContract.createQuiz(
        name,
        ethers.utils.parseEther(tokenReward),
        takerLimit,
        Math.floor(new Date(startDate).getTime() / 1000),
        Math.floor(new Date(endDate).getTime() / 1000)
      );
      await tx.wait();
      console.log('Quiz created successfully');
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const attemptQuiz = async (quizId, won) => {
    if (!quizFactoryContract) return;
    try {
      const tx = await quizFactoryContract.attemptQuiz(quizId, won);
      await tx.wait();
      console.log('Quiz attempt recorded');
      // Update user balance
      const newBalance = await quizTokenContract.balanceOf(userAddress);
      setUserBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
    }
  };

  const updateQuiz = async (quizId, newTokenReward, newTakerLimit, newStartDate, newEndDate) => {
    if (!quizFactoryContract) return;
    try {
      const tx = await quizFactoryContract.updateQuiz(
        quizId, 
        ethers.utils.parseEther(newTokenReward), 
        newTakerLimit,
        Math.floor(new Date(newStartDate).getTime() / 1000),
        Math.floor(new Date(newEndDate).getTime() / 1000)
      );
      await tx.wait();
      console.log('Quiz updated successfully');
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const withdrawRemainingTokens = async (quizId) => {
    if (!quizFactoryContract) return;
    try {
      const tx = await quizFactoryContract.withdrawRemainingTokens(quizId);
      await tx.wait();
      console.log('Remaining tokens withdrawn successfully');
      // Update user balance
      const newBalance = await quizTokenContract.balanceOf(userAddress);
      setUserBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      console.error('Error withdrawing remaining tokens:', error);
    }
  };

  const getQuizDetails = async (quizId) => {
    if (!quizFactoryContract) return null;
    try {
      const quiz = await quizFactoryContract.quizzes(quizId);
      return {
        owner: quiz.owner,
        name: quiz.name,
        tokenReward: ethers.utils.formatEther(quiz.tokenReward),
        totalTokens: ethers.utils.formatEther(quiz.totalTokens),
        takerLimit: quiz.takerLimit.toNumber(),
        takerCount: quiz.takerCount.toNumber(),
        winnerCount: quiz.winnerCount.toNumber(),
        startDate: new Date(quiz.startDate.toNumber() * 1000),
        endDate: new Date(quiz.endDate.toNumber() * 1000),
        active: quiz.active
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