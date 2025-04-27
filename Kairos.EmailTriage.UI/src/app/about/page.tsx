'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '../providers/auth/AuthContext';


const AboutPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login'); // Redirect to login page if not authenticated
        }
    }, [isAuthenticated, router]);

    // Render null or a loading indicator while checking authentication or redirecting
    if (!isAuthenticated) {
        return null; // Or return a loading spinner component
    }

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-blue-100 to-indigo-200">
            <Navbar />
            <div className=" flex items-center justify-center h-auto p-8">
                <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 my-auto">
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">About Us</h1>
                    <p className="mb-4 text-gray-700">
                        Welcome to our application! This platform is designed to help users manage and track their tickets efficiently. Our goal is to streamline the ticketing process and enhance user experience.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2 text-gray-800">Our Mission</h2>
                    <p className="mb-4 text-gray-700">
                        Our mission is to provide a seamless and user-friendly experience for managing tickets. We aim to empower users with the tools they need to stay organized and informed.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2 text-gray-800">Meet the Team</h2>
                    <p className="mb-4 text-gray-700">
                        We are a dedicated team of developers and designers passionate about creating innovative solutions. Our team works tirelessly to ensure that our application meets the needs of our users.
                    </p>
                    <h2 className="text-2xl font-semibold mb-2 text-gray-800">Contact Us</h2>
                    <p className="mb-4 text-gray-700">
                        If you have any questions or feedback, feel free to reach out to us at <a href="mailto:support@example.com" className="text-blue-600">support@example.com</a>.
                    </p>
                    <p className="mb-4 text-gray-700">
                        Follow us on social media for updates:
                    </p>
                    <ul className="list-disc list-inside mb-4 text-gray-700">
                        <li><a href="https://twitter.com/example" className="text-blue-600">Twitter</a></li>
                        <li><a href="https://facebook.com/example" className="text-blue-600">Facebook</a></li>
                        <li><a href="https://instagram.com/example" className="text-blue-600">Instagram</a></li>
                    </ul>
                </div>
            </div>
            {/* Footer */}
            <footer className="bg-blue-600 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>© 2025 Your Company. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;