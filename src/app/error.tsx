'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global error:', error);
        toast.error('Something went wrong. We have been notified.');
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 text-center space-y-6">
                <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <AlertCircle size={40} />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
                    An unexpected error occurred. We&apos;ve logged the issue and are looking into it.
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={18} />
                        Try again
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        Go to Homepage
                    </Button>
                </div>
            </div>
        </div>
    );
}
