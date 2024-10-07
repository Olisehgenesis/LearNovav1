import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;

try {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GOOGLE_AI_API_KEY is not defined in environment variables");
    }
    genAI = new GoogleGenerativeAI(apiKey);
    console.log("GenAI initialized successfully");
} catch (error) {
    console.error("Error initializing GenAI:", error);
    genAI = null;
}

export { genAI };