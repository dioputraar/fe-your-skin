"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider />
      {children}
    </AuthProvider>
  );
}
