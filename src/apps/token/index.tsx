"use client";

import { useFaucet } from "./contracts/hooks/useFaucet";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Droplet, AlertCircle } from "lucide-react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import type {
  TransactionError,
  TransactionResponse,
} from "@coinbase/onchainkit/transaction";
import type { ContractFunctionParameters } from "viem";

import { baseSepolia } from "wagmi/chains";

import faucetABI from "./contracts/abi/faucetABI.json";

export default function FaucetClaimPage() {
  const {
    faucetContractAddress,
    userClaimableAmount,
    getLastClaimTime,
    getFaucetBalance,
  } = useFaucet();
  const [lastClaimTime, setLastClaimTime] = useState<Date | null>(null);
  const [faucetBalance, setFaucetBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const time = await getLastClaimTime();
      setLastClaimTime(time);
      const balance = await getFaucetBalance();
      setFaucetBalance(balance);
    };
    fetchData();
  }, [getLastClaimTime, getFaucetBalance]);

  const formatLastClaimTime = (time: Date | null) => {
    if (!time) return "Never claimed";
    const now = new Date();
    if (time.getTime() > now.getTime()) return "Not claimed yet";
    return formatDistanceToNow(time, { addSuffix: true });
  };

  const contracts = [
    {
      address: faucetContractAddress as `0x${string}`,
      abi: faucetABI,
      functionName: "claimTokens",
      args: [],
    },
  ] as unknown as ContractFunctionParameters[];

  const handleError = (err: TransactionError) => {
    console.error("Transaction error:", err);
    if (err.message.includes("ERC20InvalidReceiver")) {
      setError(
        "Failed to claim tokens. Your account may not be able to receive ERC20 tokens. Please ensure you're using a compatible wallet."
      );
    } else {
      setError("Failed to claim tokens. Please try again.");
    }
  };

  const handleSuccess = async (response: TransactionResponse) => {
    console.log("Transaction successful", response);
    const time = await getLastClaimTime();
    setLastClaimTime(time);
    const balance = await getFaucetBalance();
    setFaucetBalance(balance);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">Faucet Claim</h1>
            <Droplet className="text-indigo-500" size={32} />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Faucet Address
              </label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-100 rounded-md p-2 break-all">
                {faucetContractAddress}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Claimable Amount:</span>
              <span className="text-lg font-semibold text-indigo-600">
                {userClaimableAmount || "0"} tokens
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Faucet Balance:</span>
              <span className="text-lg font-semibold text-green-600">
                {faucetBalance || "0"} tokens
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last Claim:</span>
              <span className="text-sm text-gray-700">
                {formatLastClaimTime(lastClaimTime)}
              </span>
            </div>
            <Transaction
              chainId={baseSepolia.id}
              contracts={contracts}
              onError={handleError}
              onSuccess={handleSuccess}
            >
              <TransactionButton text="Claim tokens"></TransactionButton>
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle size={16} />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
