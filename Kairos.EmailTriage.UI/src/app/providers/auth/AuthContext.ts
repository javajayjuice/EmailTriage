"use client"; // If you're in Next.js app/ directory

import { createContext, useContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string, useRedisCache: boolean) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
