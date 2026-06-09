"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1f2330",
            color: "#e2e8f0",
            border: "1px solid #2a3040",
            borderRadius: "10px",
            fontSize: "13px",
          },
          success: {
            iconTheme: { primary: "#a88a3d", secondary: "#0d0f14" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#0d0f14" },
          },
        }}
      />
    </QueryClientProvider>
  );
}
