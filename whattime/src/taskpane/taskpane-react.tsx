import React from "react";
import { createRoot } from "react-dom/client";
import { WhatTimeAddin } from "../components/WhatTimeAddin";
import "../styles/globals.css";

// Initialize the Office Add-in
Office.onReady(() => {
  const container = document.getElementById("container");
  if (container) {
    const root = createRoot(container);
    root.render(<WhatTimeAddin />);
  }
});
