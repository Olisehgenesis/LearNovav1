import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { account, publicClient, walletClient } from '../../hook/client';
import { formatEther } from 'viem';
import faucetABI from "../abi/faucetABI.json";

const tokenContractAddress = "0x270B4190DD62De9fbb48Cd71C6B052f5924d4FcC";
const faucetContractAddress = "0x644851C0E02831537A7e8B3C80e799e06CFdA1ff";

const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

export function useFaucet() {
  const { address: userAddress } = useAccount();
  const [userClaimableAmount, setUserClaimableAmount] = useState<string | null>(null);


  useEffect(() => {
    const fetchClaimableAmount = async () => {
      if (userAddress) {
        try {
          const canClaim = await publicClient.readContract({
            address: faucetContractAddress,
            abi: faucetABI,
            functionName: 'canClaim',
            args: [userAddress],
          }) as boolean;

          if (canClaim) {
            const claimThreshold = await publicClient.readContract({
              address: faucetContractAddress,
              abi: faucetABI,
              functionName: 'CLAIM_THRESHOLD',
            }) as bigint;
            setUserClaimableAmount(formatEther(claimThreshold));
          } else {
            setUserClaimableAmount('0');
          }
        } catch (error) {
          console.error('Error fetching claimable amount:', error);
          setUserClaimableAmount(null);
        }
      }
    };

    fetchClaimableAmount();
  }, [userAddress]);

  const claimTokens = async () => {
    try {
      const { request } = await publicClient.simulateContract({
        address: faucetContractAddress,
        abi: faucetABI,
        functionName: 'claimTokens',
        account: await account(),
      });

      const result = await walletClient.writeContract(request);
      console.log('Tokens claimed, transaction:', result);

      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: result });
      console.log('Claim transaction mined:', receipt);

      // Update the claimable amount after successful claim
      const canClaim = await publicClient.readContract({
        address: faucetContractAddress,
        abi: faucetABI,
        functionName: 'canClaim',
        args: [userAddress],
      }) as boolean;

      if (canClaim) {
        const claimThreshold = await publicClient.readContract({
          address: faucetContractAddress,
          abi: faucetABI,
          functionName: 'CLAIM_THRESHOLD',
        }) as bigint;
        setUserClaimableAmount(formatEther(claimThreshold));
      } else {
        setUserClaimableAmount('0');
      }

      return result;
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw error;
    }
  };

  const getLastClaimTime = async () => {
    try {
      const lastClaimTime = await publicClient.readContract({
        address: faucetContractAddress,
        abi: faucetABI,
        functionName: 'lastClaimTime',
        args: [userAddress],
      }) as bigint;
      return new Date(Number(lastClaimTime) * 1000);
    } catch (error) {
      console.error('Error fetching last claim time:', error);
      return null;
    }
  };

  const getFaucetBalance = async () => {
    try {
      const balance = await publicClient.readContract({
        address: tokenContractAddress,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [faucetContractAddress],
      }) as bigint;      
      return formatEther(balance);
    } catch (error) {
      console.error('Error fetching faucet balance:', error);
      return null;
    }
  };

  const getClaimInterval = async () => {
    try {
      const claimInterval = await publicClient.readContract({
        address: faucetContractAddress,
        abi: faucetABI,
        functionName: 'CLAIM_INTERVAL',
      }) as bigint;
      return Number(claimInterval);
    } catch (error) {
      console.error('Error fetching claim interval:', error);
      return null;
    }
  };

  return {
    faucetContractAddress,
    userClaimableAmount,
    claimTokens,
    getLastClaimTime,
    getFaucetBalance,
    getClaimInterval
  };
}