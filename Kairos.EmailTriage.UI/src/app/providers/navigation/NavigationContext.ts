"use client";

import { createContext, useContext } from "react";

export interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: (e: React.MouseEvent) => void; // Add onClick handler
}

interface NavigationContextType {
  navigation: NavigationItem[];
  userNavigation: NavigationItem[];
  setCurrentNavigation: (path: string) => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  navigation: [],
  userNavigation: [],
  setCurrentNavigation: () => {},
});

export const useNavigation = () => useContext(NavigationContext);