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
            // Use router to navigate after login if needed
            router.push(decodeURIComponent(redirectParam));
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
        <div className="h-screen flex">
            <div className="flex w-1/2 bg-gradient-to-tr from-blue-800 to-purple-700 i justify-around items-center">
                <div>
                    <h1 className="text-white font-bold text-4xl font-sans">GoFinance</h1>
                    <p className="text-white mt-1">The most popular peer to peer lending at SEA</p>
                    <button type="button" className="block w-28 bg-white text-indigo-800 mt-4 py-2 rounded-2xl font-bold mb-2">Read More</button>
                </div>
            </div>
            <div className="flex w-1/2 justify-center items-center bg-white">
                <form className="bg-white" onSubmit={handleSubmit}>
                    <h1 className="text-gray-800 font-bold text-2xl mb-1">Hello Again!</h1>
                    <p className="text-sm font-normal text-gray-600 mb-7">Welcome Back</p>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="flex items-center border-2 py-2 px-3 rounded-2xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        {/* INPUT */}
                        <input className="pl-2 outline-none border-none"
                            placeholder="Email Address/Username"
                            type="text"
                            id="userNameOrEmailAddress"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center border-2 py-2 px-3 rounded-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        {/* INPUT */}
                        <input className="pl-2 outline-none border-none"
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            disabled={isLoading} />
                    </div>
                    {/* BUTTON */}
                    <button className="block w-full bg-indigo-600 mt-4 py-2 rounded-2xl text-white font-semibold mb-2"
                        type="submit"
                        disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>
                    <span className="text-sm ml-2 hover:text-blue-500 cursor-pointer">Forgot Password ?</span>

                    <div className="mt-4">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-indigo-600"
                                checked={useRedisCache}
                                onChange={(e) => setUseRedisCache(e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600">Use Redis Cache</span>
                        </label>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;