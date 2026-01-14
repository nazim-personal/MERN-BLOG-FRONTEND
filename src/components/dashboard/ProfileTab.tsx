import { Mail } from 'lucide-react';

interface ProfileTabProps {
    userName: string;
    userEmail: string;
}

export function ProfileTab({ userName, userEmail }: ProfileTabProps) {
    return (
        <div className="p-8 transition-all duration-500 opacity-100 translate-y-0">
            <div className="flex items-center space-x-6 mb-8">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {(userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                    <p className="text-gray-500 flex items-center mt-1">
                        <Mail size={16} className="mr-2" />
                        {userEmail}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Member Since</span>
                            <span className="text-gray-900 font-medium">January 2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
