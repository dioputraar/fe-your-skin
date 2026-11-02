"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

interface CanProps {
  do?: string | string[];
  role?: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function Can({
  do: permission,
  role,
  children,
  fallback = null,
}: CanProps) {
  const { hasPermission, hasRole } = useAuth();

  let isAllowed = true;

  if (role && !hasRole(role)) {
    isAllowed = false;
  }

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
