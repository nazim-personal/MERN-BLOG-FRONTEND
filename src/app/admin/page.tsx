'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, ArrowLeft, RefreshCw, AlertCircle, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

import { ApiResponse } from '@/types/api';
import { AdminStats } from '@/types/models';

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiResponse<AdminStats>>('/api/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch stats');
            }
        } catch (err: unknown) {
            // This now only catches non-API errors
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    interface StatCardProps {
        title: string;
        value: number;
        icon: LucideIcon; // Lucide icons are complex to type strictly here without extra imports, but we can use React.ComponentType
        color: string;
        description: string;
    }

    const StatCard = ({ title, value, icon: Icon, color, description }: StatCardProps) => (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-4xl font-bold text-gray-900">
                        {loading ? (
                            <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-lg mt-1"></div>
                        ) : (
                            value
                        )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">{description}</p>
                </div>
                <div className={`p-4 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                title="Back to User Dashboard"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Admin Control Panel
                                </h1>
                                <p className="text-xs text-gray-400 font-medium">System Overview & Management</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Refresh Data
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={Users}
                        color="bg-gradient-to-br from-blue-500 to-indigo-600"
                        description="Registered accounts in the system"
                    />
                    <StatCard
                        title="Total Posts"
                        value={stats?.totalPosts || 0}
                        icon={FileText}
                        color="bg-gradient-to-br from-purple-500 to-pink-600"
                        description="Published and draft blog articles"
                    />
                    <StatCard
                        title="Total Comments"
                        value={stats?.totalComments || 0}
                        icon={MessageSquare}
                        color="bg-gradient-to-br from-orange-400 to-red-500"
                        description="User interactions on posts"
                    />
                </div>

                {/* Quick Actions / Recent Activity Placeholder */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">System Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold text-green-900">API Gateway</span>
                                </div>
                                <span className="text-xs font-bold text-green-600 uppercase">Operational</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold text-green-900">Database Cluster</span>
                                </div>
                                <span className="text-xs font-bold text-green-600 uppercase">Operational</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-semibold text-blue-900">Storage Service</span>
                                </div>
                                <span className="text-xs font-bold text-blue-600 uppercase">Healthy</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Management</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-100 border border-gray-100 rounded-2xl text-left transition-all group">
                                <Users className="text-gray-400 group-hover:text-indigo-600 mb-2" size={24} />
                                <p className="text-sm font-bold text-gray-900">Manage Users</p>
                                <p className="text-xs text-gray-500">Roles & Permissions</p>
                            </button>
                            <button className="p-4 bg-gray-50 hover:bg-purple-50 hover:border-purple-100 border border-gray-100 rounded-2xl text-left transition-all group">
                                <FileText className="text-gray-400 group-hover:text-purple-600 mb-2" size={24} />
                                <p className="text-sm font-bold text-gray-900">Review Posts</p>
                                <p className="text-xs text-gray-500">Content Moderation</p>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
