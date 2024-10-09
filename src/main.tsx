import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter

import App from "./App.tsx";

import { Providers } from "./providers";
import "./index.css";
import "@coinbase/onchainkit/styles.css";

globalThis.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Providers>
  </React.StrictMode>
);
