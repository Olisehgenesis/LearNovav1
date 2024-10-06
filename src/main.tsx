import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter

import App from "./App.tsx";
import { config } from "./wagmi.ts";
import { Providers } from "./providers";
import "./index.css";
import "@coinbase/onchainkit/styles.css";
import { baseSepolia } from "viem/chains";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();
const key = import.meta.env.VITE_ONCHAINKIT_API_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Providers>
  </React.StrictMode>
);
