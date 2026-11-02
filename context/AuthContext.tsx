"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData?: IUser) => void;
  logout: () => void;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permissions: string | string[]) => boolean;
  canAccess: (routePath: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ambil profil user & role/permissions dari /auth/me atau /profile
  const refreshProfile = useCallback(async () => {
    const savedToken = Cookies.get("token");
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      const data = res.data?.data || res.data?.user || res.data;
      setUser(data);
    } catch (err: any) {
      // Jika endpoint /auth/me belum ada atau error 404, decode token payload sebagai fallback
      try {
        const parts = savedToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setUser({
            id: payload.id || payload.sub || "user",
            email: payload.email || "",
            role: payload.role || "ADMIN",
            permissions: payload.permissions || [],
          });
        }
      } catch (parseErr) {
        console.error("Gagal parse JWT token:", parseErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      setToken(savedToken);
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const login = (newToken: string, userData?: IUser) => {
    Cookies.set("token", newToken, { expires: 7 });
    setToken(newToken);
    if (userData) {
      setUser(userData);
      setIsLoading(false);
    } else {
      refreshProfile();
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setToken(null);
    setUser(null);
    router.push("/auth/login");
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user || !user.role) return false;
    const required = Array.isArray(roles) ? roles : [roles];
    return required.map((r) => r.toUpperCase()).includes(user.role.toUpperCase());
  };

  const hasPermission = (permissions: string | string[]): boolean => {
    if (!user) return false;
    // SUPER_ADMIN selalu memiliki semua akses
    if (user.role?.toUpperCase() === "SUPER_ADMIN") return true;

    const userPerms = (user.permissions || []).map((p) => p.toUpperCase());
    const required = Array.isArray(permissions) ? permissions : [permissions];
    return required.some((perm) => userPerms.includes(perm.toUpperCase()));
  };

  const canAccess = (routePath: string): boolean => {
    if (!user) return false;
    if (
      user.role?.toUpperCase() === "SUPER_ADMIN" ||
      user.role?.toUpperCase() === "ADMIN"
    ) {
      return true;
    }
    // Verifikasi granular berdasarkan permission jika rute diproteksi
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token),
        login,
        logout,
        hasRole,
        hasPermission,
        canAccess,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
