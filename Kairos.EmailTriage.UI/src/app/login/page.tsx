'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../providers/auth/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [useRedisCache, setUseRedisCache] = useState<boolean>(true);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Load cache preference from localStorage on mount
    useEffect(() => {
        const savedPreference = localStorage.getItem('useRedisCache');
        if (savedPreference !== null) {
            setUseRedisCache(savedPreference === 'true');
        }
    }, []);

    // Save cache preference when it changes
    useEffect(() => {
        localStorage.setItem('useRedisCache', useRedisCache.toString());
    }, [useRedisCache]);

    useEffect(() => {
        // Check for error in URL parameters (from middleware redirect)
        const errorParam = searchParams.get('error');
        if (errorParam === 'session_verification_failed') {
            setError('Your session could not be verified. Please log in again.');
        } else if (errorParam === 'session_expired') {
            setError('Your session has expired. Please log in again.');
        }
        
        // Display any redirect URL for transparency
        const redirectParam = searchParams.get('redirect');
        if (redirectParam) {
            console.log('After login you will be redirected to:', decodeURIComponent(redirectParam));
        }
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate inputs
            if (!username.trim()) {
                throw new Error('Username is required');
            }
            
            if (!password) {
                throw new Error('Password is required');
            }
            
            await login(username, password, useRedisCache);
            // Login success is handled in the AuthContext
        } catch (error: any) {
            console.error('Login error:', error);
            setError('Login failed: ' + (error.message || 'Unknown error occurred'));
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

                {/* Display redirect message if present */}
                {searchParams.get('redirect') && (
                    <div className="mb-5 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 text-sm">
                        You'll be redirected after login
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
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
                            autoComplete="username"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
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
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="useRedisCache"
                            checked={useRedisCache}
                            onChange={(e) => setUseRedisCache(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={isLoading}
                        />
                        <label htmlFor="useRedisCache" className="ml-2 block text-sm text-gray-700">
                            Use Redis cache for session management
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-all hover:scale-105 disabled:scale-100 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;