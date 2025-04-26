import React from 'react';
import Navbar from '@/components/Navbar';

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
            <Navbar />
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 mt-10">
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
    );
};

export default AboutPage;