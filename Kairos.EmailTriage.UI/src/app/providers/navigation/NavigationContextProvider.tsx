"use client";

import { ReactNode, useEffect, useState } from "react";
import { NavigationContext, NavigationItem } from "./NavigationContext";
import { usePathname } from "next/navigation";
import { useAuth } from "../auth/AuthContext";

interface Props {
    children: ReactNode;
}

const initialNavigation: NavigationItem[] = [
    { name: 'Ticket Center', href: '/tickets', current: false },
    { name: 'Dashboard', href: '/dashboard', current: false },
    { name: 'About', href: '/about', current: false },
];

// Base user navigation without logout handling
const baseUserNavigation: Omit<NavigationItem, 'onClick'>[] = [
    { name: 'Your Profile', href: '#', current: false },
    { name: 'Settings', href: '#', current: false },
];

export function NavigationContextProvider({ children }: Props) {
    const [navigation, setNavigation] = useState<NavigationItem[]>(initialNavigation);
    const [userNavigation, setUserNavigation] = useState<NavigationItem[]>([]);
    const pathname = usePathname();
    const { logout } = useAuth();

    // Initialize user navigation with logout handler
    useEffect(() => {
        // Create a complete user navigation array with logout functionality
        const completeUserNavigation: NavigationItem[] = [
            ...baseUserNavigation,
            {
                name: 'Log out',
                href: '#',
                current: false,
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    logout();
                }
            }
        ];

        setUserNavigation(completeUserNavigation);
    }, [logout]);

    // Update current navigation item based on the current path
    const setCurrentNavigation = (path: string) => {
        setNavigation(prev =>
            prev.map(item => ({
                ...item,
                current: path === item.href || (item.href !== '/' && item.href !== '#' && path.startsWith(item.href))
            }))
        );

        setUserNavigation(prev =>
            prev.map(item => ({
                ...item,
                current: path === item.href
            }))
        );
    };

    // Update navigation when path changes
    useEffect(() => {
        if (pathname) {
            setCurrentNavigation(pathname);
        }
    }, [pathname]);

    return (
        <NavigationContext.Provider
            value={{
                navigation,
                userNavigation,
                setCurrentNavigation,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
}