'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import axios from '@/lib/axios';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');
            const error = searchParams.get('error');

            if (error) {
                console.error('Social login error param:', error);
                toast.error(decodeURIComponent(error));
                router.push('/signin');
                return;
            }

            if (accessToken && refreshToken) {
                try {
                    await axios.post('/auth/social-login-success', {
                        accessToken,
                        refreshToken
                    });

                    toast.success('Successfully signed in!');
                    router.push('/dashboard');
                    router.refresh();
                } catch (err) {
                    console.error('Social login error:', err);
                    toast.error('Failed to complete sign in: ' + (err as Error).message);
                    router.push('/signin');
                }
            } else {
                console.warn('Missing tokens in callback URL');
                toast.error('Authentication failed: Missing tokens');
                router.push('/signin');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Spinner className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
                <p className="text-gray-500 mt-2">Please wait while we redirect you.</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner className="h-12 w-12 text-purple-600" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
