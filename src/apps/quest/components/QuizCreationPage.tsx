import React, { useState, useMemo, ChangeEvent } from "react";
import {
  Button,
  Input,
  TextareaAutosize,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { saveDocument, saveQuiz, saveReward } from "../../../lib/db";
import { useQuizToken } from "../../token/hook/useQuizToken";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
import { Abi, parseEther, ContractFunctionParameters } from "viem";
import { baseSepolia } from "wagmi/chains";

interface QuizData {
  questions:
    | string
    | Array<{
        id: number;
        text: string;
        options: Array<{
          letter: string;
          text: string;
        }>;
      }>;
  summary: string;
}

interface QuizCreationPageProps {
  genAI: GoogleGenerativeAI;
  onQuizCreated: (quizData: QuizData) => void;
}

const simplifiedABI = [
  {
    type: "function",
    name: "createQuiz",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_tokenReward", type: "uint256" },
      { name: "_takerLimit", type: "uint256" },
      { name: "_startDate", type: "uint256" },
      { name: "_endDate", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "QuizCreated",
    inputs: [
      { name: "quizId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "tokenReward", type: "uint256", indexed: false },
      { name: "takerLimit", type: "uint256", indexed: false },
      { name: "startDate", type: "uint256", indexed: false },
      { name: "endDate", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
];

const QuizCreationPage: React.FC<QuizCreationPageProps> = ({
  genAI,
  onQuizCreated,
}) => {
  const [step, setStep] = useState(1);
  const { ensName, userAddress, userBalance } = useQuizToken();
  const [quizData, setQuizData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    coverImage: undefined as File | undefined,
    description: "",
    rewards: [{ token: "LLT", amount: 50 }],
    quizContent: "",
    quizFile: null as File | null,
    numQuestions: 10,
    requiredPassScore: 70,
    limitTakers: false,
    takerLimit: null as number | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlockchainQuizCreated, setIsBlockchainQuizCreated] = useState(false);
  const [blockchainQuizId, setBlockchainQuizId] = useState<number | null>(null);

  const creationFee = 50;
  const QUIZ_FACTORY_ADDRESS = "0x2e026c70E43d76aA00040ECD85601fF47917C157";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuizData((prev) => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setQuizData((prev) => ({ ...prev, [name]: file }));
      if (name === "coverImage" && file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else {
      setQuizData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRewardChange = (index: number, field: string, value: string) => {
    const updatedRewards = [...quizData.rewards];
    updatedRewards[index] = { ...updatedRewards[index], [field]: value };
    setQuizData((prev) => ({ ...prev, rewards: updatedRewards }));
  };

  const addReward = () => {
    setQuizData((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { token: "", amount: 0 }],
    }));
  };

  const calculateTotalCost = () => {
    const rewardSum = quizData.rewards.reduce(
      (sum, reward) => sum + Number(reward.amount),
      0
    );
    return creationFee + rewardSum;
  };
  const generateContracts = useMemo(() => {
    const totalCost = calculateTotalCost();
    const startTimestamp = new Date(quizData.startDate).getTime();
    const endTimestamp = new Date(quizData.endDate).getTime();

    if (isNaN(totalCost) || isNaN(startTimestamp) || isNaN(endTimestamp)) {
      throw new Error("Invalid quiz data. Please check all fields.");
    }

    return [
      {
        address: QUIZ_FACTORY_ADDRESS as `0x${string}`,
        abi: simplifiedABI as Abi,
        functionName: "createQuiz",
        args: [
          quizData.name,
          parseEther(totalCost.toString()), // Convert to wei
          BigInt(1000), // Set taker limit to 0 (unlimited)
          BigInt(Math.floor(startTimestamp / 1000)),
          BigInt(Math.floor(endTimestamp / 1000)),
        ],
      },
    ] as const;
  }, [quizData, calculateTotalCost]);

  const handleBlockchainError = (err: TransactionError) => {
    console.error("Blockchain transaction error:", err);
    setError("Failed to create quiz on blockchain. Please try again.");
  };

  const handleBlockchainSuccess = (response: TransactionResponse) => {
    console.log("Blockchain transaction successful", response);
    // Extract quizId from the QuizCreated event
    let quizId: number | null = null;

    for (const receipt of response.transactionReceipts) {
      const quizCreatedEvent = receipt.logs.find(
        (log) =>
          log.topics[0] ===
          simplifiedABI.find((item) => item.name === "QuizCreated")?.name
      );

      if (quizCreatedEvent && quizCreatedEvent.data) {
        // Assuming the quizId is the first parameter in the event data
        quizId = Number(quizCreatedEvent.topics[1]); // The indexed quizId should be in topics[1]
        break; // Exit the loop once we find the event
      }
    }

    if (quizId !== null) {
      setBlockchainQuizId(quizId);
      setIsBlockchainQuizCreated(true);
      console.log("Quiz created with ID:", quizId);
    } else {
      console.error("QuizCreated event not found in transaction logs");
      setError(
        "Failed to extract quiz ID from transaction. Please check and try again."
      );
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isBlockchainQuizCreated || blockchainQuizId === null) {
        throw new Error("Blockchain quiz not created yet");
      }

      let quizContent = quizData.quizContent;
      if (quizData.quizFile) {
        const fileContent = await readFileContent(quizData.quizFile);
        quizContent += "\n\n" + fileContent;
      }

      // Generate summary
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const summaryResult = await model.generateContent(
        `Summarize this text in 2-3 sentences: ${quizContent}`
      );
      const summary = await summaryResult.response.text();

      // Generate questions
      const questionsResult = await model.generateContent(`
        Based on the following text, generate ${quizData.numQuestions} multiple-choice questions.
        Each question should directly relate to the content of the text.
        For each question,
        provide 4 options labeled A, B, C, and D, where only one option is correct and
        the other three plausible but incorrect options.
        Ensure that the questions cover different aspects of the text and vary in difficulty.
        Format the output exactly as follows:

        Question 1: [Question text]
        A. [Option A]
        B. [Option B]
        C. [Option C]
        D. [Option D]

        Question 2: [Question text]
        A. [Option A]
        B. [Option B]
        C. [Option C]
        D. [Option D]

        (... and so on for all ${quizData.numQuestions} questions)

        Text: ${quizContent}
      `);

      const questionsText = await questionsResult.response.text();
      const questions = questionsText.split("\n\n").map((q, index) => {
        const [questionText, ...options] = q.split("\n");
        return {
          id: index + 1,
          text: questionText.replace(/^Question \d+: /, ""),
          options: options.map((opt) => opt.substring(3)),
        };
      });

      // Save document
      const documentId = await saveDocument(quizContent, summary);

      // Save quiz
      const savedQuiz = await saveQuiz({
        name: quizData.name,
        documentId: documentId as number,
        questions: JSON.stringify(questions),
        numQuestions: quizData.numQuestions,
        limitTakers: quizData.limitTakers,
        takerLimit: quizData.takerLimit,
        requiredPassScore: quizData.requiredPassScore,
        startDate: quizData.startDate,
        endDate: quizData.endDate,
        coverImage: quizData.coverImage,
        courseDistribution: "equal",
        blockId: blockchainQuizId.toString(),
      });

      // Save rewards
      for (const reward of quizData.rewards) {
        await saveReward(savedQuiz.id, reward.token, reward.amount, "equal");
      }

      onQuizCreated({
        questions: JSON.stringify(questions),
        summary: summary,
      });

      console.log("Quiz created successfully with ID:", savedQuiz.id);
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Failed to create quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
          <h2 className="mt-4 text-xl font-semibold text-white">
            Creating Quiz...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Create New Quiz</h1>
      {/* User Info */}
      <Alert className="mb-4" severity="info">
        <AlertTitle>Your Information</AlertTitle>
        <p>Address: {userAddress}</p>
        <p>BaseName: {ensName}</p>
        <p>Balance: {userBalance} LLT</p>
      </Alert>

      {/* Step Indicator */}
      <div className="flex mb-2">
        <div className="relative w-full h-2 bg-gray-600 rounded">
          <div
            className={`absolute h-full bg-blue-700 rounded ${
              step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
            }`}
          />
        </div>
      </div>
      <div className="flex justify-between w-full">
        <span
          className={`text-sm ${
            step === 1 ? "text-blue-700" : "text-gray-400"
          }`}
        >
          Step 1
        </span>
        <span
          className={`text-sm ${
            step === 2 ? "text-blue-700" : "text-gray-400"
          }`}
        >
          Step 2
        </span>
        <span
          className={`text-sm ${
            step === 3 ? "text-blue-700" : "text-gray-400"
          }`}
        >
          Step 3
        </span>
      </div>

      {/* Step 1: Quiz Details */}
      {step === 1 && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8">
            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="name" className="text-lg font-bold">
                Quiz Name
              </FormLabel>
              <Input
                id="name"
                name="name"
                value={quizData.name}
                onChange={handleInputChange}
                placeholder="Enter quiz name"
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>

            <div className="flex mb-4 space-x-4">
              <div className="w-1/2">
                <FormControl fullWidth margin="normal">
                  <FormLabel htmlFor="startDate" className="text-lg font-bold">
                    Start Date
                  </FormLabel>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={quizData.startDate}
                    onChange={handleInputChange}
                    className="border border-gray-500 rounded-md text-lg p-2"
                  />
                </FormControl>
              </div>
              <div className="w-1/2">
                <FormControl fullWidth margin="normal">
                  <FormLabel htmlFor="endDate" className="text-lg font-bold">
                    End Date
                  </FormLabel>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={quizData.endDate}
                    onChange={handleInputChange}
                    className="border border-gray-500 rounded-md text-lg p-2"
                  />
                </FormControl>
              </div>
            </div>

            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="coverImage" className="text-lg font-bold">
                Cover Image
              </FormLabel>
              <Input
                id="coverImage"
                name="coverImage"
                type="file"
                onChange={handleFileChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto border rounded-md"
                />
              </div>
            )}

            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="description" className="text-lg font-bold">
                Description
              </FormLabel>
              <TextareaAutosize
                id="description"
                name="description"
                value={quizData.description}
                onChange={handleInputChange}
                placeholder="Enter quiz description"
                minRows={4}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Quiz Rewards */}
      {step === 2 && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">Quiz Rewards</h2>
            {quizData.rewards.map((reward, index) => (
              <div key={index} className="mb-4 flex items-center space-x-4">
                <div className="w-1/3">
                  <FormControl fullWidth margin="normal">
                    <FormLabel
                      htmlFor={`token-${index}`}
                      className="text-lg font-bold"
                    >
                      Token
                    </FormLabel>
                    <Input
                      id={`token-${index}`}
                      value={reward.token}
                      onChange={(e) =>
                        handleRewardChange(index, "token", e.target.value)
                      }
                      placeholder="Token name"
                      className="border border-gray-500 rounded-md text-lg p-2"
                    />
                  </FormControl>
                </div>
                <div className="w-1/3">
                  <FormControl fullWidth margin="normal">
                    <FormLabel
                      htmlFor={`amount-${index}`}
                      className="text-lg font-bold"
                    >
                      Amount
                    </FormLabel>
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      value={reward.amount}
                      onChange={(e) =>
                        handleRewardChange(index, "amount", e.target.value)
                      }
                      placeholder="Reward amount"
                      className="border border-gray-500 rounded-md text-lg p-2"
                    />
                  </FormControl>
                </div>
                {index === 0 && (
                  <Button
                    onClick={addReward}
                    className="mt-6 font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-gray-800 text-white border border-gray-600 py-3 px-6 rounded"
                  >
                    Add Reward
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Quiz Content */}
      {step === 3 && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">Quiz Content</h2>
            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="numQuestions" className="text-lg font-bold">
                Number of Questions (max 20)
              </FormLabel>
              <Input
                id="numQuestions"
                name="numQuestions"
                type="number"
                value={quizData.numQuestions}
                onChange={handleInputChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel
                htmlFor="requiredPassScore"
                className="text-lg font-bold"
              >
                Required Pass Score (%)
              </FormLabel>
              <Input
                id="requiredPassScore"
                name="requiredPassScore"
                type="number"
                value={quizData.requiredPassScore}
                onChange={handleInputChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="quizContent" className="text-lg font-bold">
                Quiz Questions
              </FormLabel>
              <TextareaAutosize
                id="quizContent"
                name="quizContent"
                value={quizData.quizContent}
                onChange={handleInputChange}
                placeholder="Enter quiz questions or upload a file"
                minRows={10}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="quizFile" className="text-lg font-bold">
                Or Upload Quiz File
              </FormLabel>
              <Input
                id="quizFile"
                name="quizFile"
                type="file"
                onChange={handleInputChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-between items-center">
        {step > 1 && (
          <Button
            onClick={() => setStep(step - 1)}
            disabled={isLoading}
            className="font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-gray-800 text-white border border-gray-600 py-3 px-6 rounded disabled:opacity-50"
          >
            Previous
          </Button>
        )}
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={isLoading}
            className="ml-auto font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-gray-800 text-white border border-gray-600 py-3 px-6 rounded disabled:opacity-50"
          >
            Next
          </Button>
        ) : (
          <>
            {!isBlockchainQuizCreated ? (
              <Transaction
                chainId={baseSepolia.id}
                contracts={
                  generateContracts as unknown as ContractFunctionParameters[]
                }
                onError={handleBlockchainError}
                onSuccess={handleBlockchainSuccess}
              >
                <TransactionButton text="Create Blockchain Quiz" />
                <TransactionStatus>
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </TransactionStatus>
              </Transaction>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="ml-auto font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded disabled:opacity-50"
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Complete Quiz Creation"
                )}
              </Button>
            )}
          </>
        )}
      </div>

      {error && (
        <Alert className="mt-6" severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Alert className="mt-6" severity="info">
        <AlertTitle>Note</AlertTitle>
        Creating a quiz requires a fee of {creationFee} LLT tokens, plus the
        total reward amount. Total cost: {calculateTotalCost()} LLT
      </Alert>
    </div>
  );
};

export default QuizCreationPage;
