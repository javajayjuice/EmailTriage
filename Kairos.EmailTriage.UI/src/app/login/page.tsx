'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('https://localhost:44311/api/TokenAuth/Authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "userNameOrEmailAddress":username, "password":password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data: { token: string } = await response.json();
            localStorage.setItem('token', data.token);
            router.push('/tickets');
        } catch (err) {
            setError('Invalid username or password'+err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">Sign In</h2>

                {error && (
                    <div className="mb-5 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label htmlFor="userNameOrEmailAddress" className="block text-sm font-semibold text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="userNameOrEmailAddress"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-all hover:scale-105 disabled:scale-100"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;