import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
  import { Toaster } from "./components/ui/sonner";
  import "./index.css";
  import "./styles/colors.css";
  import "./styles/modern-design.css";

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <Toaster richColors position="top-right" />
    </>
  );
  