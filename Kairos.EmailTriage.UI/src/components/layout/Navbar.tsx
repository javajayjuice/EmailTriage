"use client";

import { useAuth } from "@/app/providers/auth/AuthContext";
import Link from "next/link";
import { useContext } from "react";

// Navbar Component (Reusable)
const Navbar: React.FC = () => {
  const { logout } = useAuth(); 

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 bg-blue-600 text-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/" className="text-lg font-semibold hover:text-gray-200">
            Home
          </Link>
          <Link href="/tickets" className="text-lg hover:text-gray-200">
            Tickets
          </Link>
          <Link href="/about" className="text-lg hover:text-gray-200">
            About
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogout}
            className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
          >
            Logout
          </button>
          {/* Placeholder for user profile/avatar */}
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700">U</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;