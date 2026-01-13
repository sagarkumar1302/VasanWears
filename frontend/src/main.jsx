import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Toaster 
      position="bottom-center" 
      reverseOrder={false}
      toastOptions={{
        // Shorter duration for mobile
        duration: 800,
        // Click to dismiss
        onClick: (toast) => {
          if (toast && typeof toast.dismiss === 'function') {
            toast.dismiss();
          }
        },
        style: {
          cursor: 'pointer',
        },
        // Error toast specific styling
        error: {
          duration: 1200,
          style: {
            cursor: 'pointer',
          },
        },
        // Success toast specific styling
        success: {
          duration: 2500,
          style: {
            cursor: 'pointer',
          },
        },
      }}
    />
    <App />
  </GoogleOAuthProvider>
);
