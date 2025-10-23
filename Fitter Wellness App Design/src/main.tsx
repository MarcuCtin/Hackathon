
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { Toaster } from "./components/ui/sonner";
  import { AuthProvider } from "./hooks/useAuth";
  import { ActivityProvider } from "./context/ActivityContext";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <ActivityProvider>
        <>
          <App />
          <Toaster richColors position="top-right" />
        </>
      </ActivityProvider>
    </AuthProvider>
  );
  