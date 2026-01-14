'use client';

import { FileText, User as UserIcon, Users as UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProfileTab } from './dashboard/ProfileTab';
import { PostsTab } from './dashboard/PostsTab';
import { UsersTab } from './dashboard/UsersTab';

interface DashboardTabsProps {
    userName: string;
    userEmail: string;
    permissions: string[];
}

export function DashboardTabs({ userName, userEmail, permissions }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = useMemo(() => {
        const allTabs = [
            { id: 'profile', label: 'Profile', icon: UserIcon, permission: 'posts:view' }, // Everyone can see profile
            { id: 'posts', label: 'Posts', icon: FileText, permission: 'posts:view' },
            { id: 'users', label: 'Users', icon: UsersIcon, permission: 'users:view' },
        ];

        return allTabs.filter(tab => permissions.includes(tab.permission) || tab.id === 'profile');
    }, [permissions]);

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center space-x-2 w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer'
                                }`}
                        >
                            <Icon size={18} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300">
                {activeTab === 'profile' && (
                    <ProfileTab userName={userName} userEmail={userEmail} />
                )}

                {activeTab === 'posts' && (
                    <PostsTab userName={userName} userEmail={userEmail} permissions={permissions} />
                )}

                {activeTab === 'users' && (
                    <UsersTab />
                )}
            </div>
        </div>
    );
}
