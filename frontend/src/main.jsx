import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./fonts/fonts.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster, toast } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Toaster 
      position="bottom-center" 
      reverseOrder={false}
      containerStyle={{
        bottom: 80,
      }}
      toastOptions={{
        duration: 2500,
        style: {
          padding: '12px 16px',
          fontSize: '14px',
          cursor: 'pointer',
          userSelect: 'none',
        },
        error: {
          duration: 1200,
          style: {
            cursor: 'pointer',
            userSelect: 'none',
          },
        },
        success: {
          duration: 2000,
          style: {
            cursor: 'pointer',
            userSelect: 'none',
          },
        },
      }}
      onClick={(t) => toast.dismiss(t.id)}
    />
    <App />
  </GoogleOAuthProvider>
);
