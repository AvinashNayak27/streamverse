import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";
import "./polyfills.js";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig, chains } from "./wagmi.js";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RequestAd from "./RequestAd.jsx";
import Dashboard from "./Dashboard.jsx";
import Premium from "./Premium.jsx";

const client = createReactClient({
  provider: studioProvider({ apiKey: "e6fe7d3c-6f2b-44dc-b5a1-9e938f649113" }),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <LivepeerConfig client={client}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/request-ad" element={<RequestAd />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/premium" element={<Premium />} />
          </Routes>
        </BrowserRouter>
        </LivepeerConfig>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
