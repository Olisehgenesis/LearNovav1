import { createContext, Dispatch, SetStateAction } from "react";

// Define a type for the context value
interface ChainContextType {
    selectedChainId: string;
    setSelectedChainId: Dispatch<SetStateAction<string>>;
}

// Create the context with a default value
const ChainContext = createContext<ChainContextType>({
    selectedChainId: "1", // Default value
    setSelectedChainId: () => {}, // Default no-op function
});

export default ChainContext;
