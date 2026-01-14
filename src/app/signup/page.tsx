'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/error-utils';
import { validateEmail, validatePassword } from '@/lib/validation';
import axios from '@/lib/axios';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import toast from 'react-hot-toast';
import { ApiResponse } from '@/types/api';
import { User } from '@/types/models';

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; form?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!formData.name) newErrors.name = 'Name is required';

        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;

        const passwordError = validatePassword(formData.password);
        if (passwordError) newErrors.password = passwordError;

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!validate()) return;

        setIsLoading(true);
        const loadingToast = toast.loading('Creating account...');

        try {
            // Call our Next.js API route
            const response = await axios.post<ApiResponse<User>>('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                toast.success(response.data.message || 'Account created! Please sign in.', { id: loadingToast });
                router.push('/signin');
            } else {
                // Error is already toasted by axios interceptor
                toast.dismiss(loadingToast);
                setErrors({ form: response.data.message });
            }
        } catch (error: unknown) {
            toast.dismiss(loadingToast);
            const message = getErrorMessage(error);
            setErrors({ form: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-purple-500 to-pink-500 p-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-400/30 blur-[100px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-pink-400/30 blur-[100px] animate-pulse delay-1000" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-400/30 blur-[100px] animate-pulse delay-2000" />
            </div>

            <div className="max-w-md w-full z-10">
                <ErrorBoundary>
                    <div className="space-y-8 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 transition-all duration-300 hover:shadow-purple-500/20">
                        <div className="text-center">
                            <div className="mx-auto h-20 w-20 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl -rotate-3 flex items-center justify-center shadow-lg transform transition-transform hover:rotate-0 hover:scale-110 group">
                                <UserPlus className="h-10 w-10 text-white group-hover:animate-bounce" />
                            </div>
                            <h2 className="mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">
                                Create Account
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 font-medium">
                                Join our colorful community today
                            </p>
                        </div>

                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            <div className="group">
                                <Input
                                    id="name"
                                    label="Full Name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    error={errors.name}
                                    disabled={isLoading}
                                    className="group-hover:bg-white"
                                />
                            </div>

                            <div className="group">
                                <Input
                                    id="email"
                                    label="Email address"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    error={errors.email}
                                    disabled={isLoading}
                                    className="group-hover:bg-white"
                                />
                            </div>

                            <div className="group">
                                <Input
                                    id="password"
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    error={errors.password}
                                    disabled={isLoading}
                                    className="group-hover:bg-white"
                                />
                            </div>

                            <div className="group">
                                <Input
                                    id="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    error={errors.confirmPassword}
                                    disabled={isLoading}
                                    className="group-hover:bg-white"
                                />
                            </div>

                            {errors.form && (
                                <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2 shadow-sm">
                                    <p className="text-sm font-bold text-red-800 text-center">{errors.form}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 mt-4"
                                isLoading={isLoading}
                            >
                                Sign up
                            </Button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white/90 text-gray-500 font-medium rounded-full">
                                        Or sign up with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api/v1'}/auth/google`}
                                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
                                    aria-label="Sign up with Google"
                                >
                                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </button>

                                <button
                                    type="button"
                                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api/v1'}/auth/facebook`}
                                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
                                    aria-label="Sign up with Facebook"
                                >
                                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </button>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 font-medium">
                                Already have an account?{' '}
                                <Link href="/signin" className="font-bold text-purple-600 hover:text-pink-600 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </ErrorBoundary>
            </div>
        </div>
    );
}
