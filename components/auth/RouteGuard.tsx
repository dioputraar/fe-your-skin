"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@heroui/react";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  fallbackPath?: string;
}

export default function RouteGuard({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = "/catalog",
}: RouteGuardProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, hasRole, hasPermission } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Jika belum login, redirect ke login
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    let allowed = true;

    if (requiredRole && !hasRole(requiredRole)) {
      allowed = false;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      allowed = false;
    }

    if (!allowed) {
      toast.danger("Akses Ditolak: Anda tidak memiliki izin untuk halaman ini.");
      router.replace(fallbackPath);
    } else {
      setIsAuthorized(true);
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    requiredRole,
    requiredPermission,
    fallbackPath,
    router,
    hasRole,
    hasPermission,
  ]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#EFF4F7]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-skin-blue" size={32} />
          <span className="text-xs font-semibold text-skin-muted">
            Memverifikasi hak akses...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
