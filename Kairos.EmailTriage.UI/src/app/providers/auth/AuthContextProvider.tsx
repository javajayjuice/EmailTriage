"use client";

import { AuthContext } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function AuthContextProvider({ children }: Props) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Add the useRedisCache parameter to your login function
  const login = async (username: string, password: string, useRedisCache: boolean = true) => {
    try {
      // Set the cache preference in localStorage for other components
      localStorage.setItem('useRedisCache', useRedisCache.toString());
      
      // Authentication against your API
      const response = await fetch('https://localhost:44311/api/TokenAuth/Authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNameOrEmailAddress: username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || "Invalid credentials");
      }

      const data = await response.json();
      
      // Store token in localStorage for client-side use
      localStorage.setItem("token", data.result.accessToken);
      
      // Create a server-side session with cache preference
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: data.result.accessToken,
          useRedisCache: useRedisCache 
        }),
      });
      
      setIsAuthenticated(true);
      
      // Check for redirect URL from middleware
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      if (redirectPath) {
        router.push(decodeURIComponent(redirectPath));
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear client-side storage
    localStorage.removeItem("token");
    
    // Clear server-side session
    await fetch('/api/auth/session', {
      method: 'DELETE',
    });
    
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
