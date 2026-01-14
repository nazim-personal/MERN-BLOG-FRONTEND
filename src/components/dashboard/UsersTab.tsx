import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { User } from '@/types/models';
import { User as UserIcon, Shield, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UsersTab() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<ApiResponse<User[]>>('/auth/users');
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (_error: unknown) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="pb-4 font-semibold">User</th>
                            <th className="pb-4 font-semibold">Role</th>
                            <th className="pb-4 font-semibold">Status</th>
                            <th className="pb-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${user.role === 'admin'
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'bg-blue-50 text-blue-700'
                                        }`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-2"></span>
                                    <span className="text-xs text-gray-600">Active</span>
                                </td>
                                <td className="py-4 text-right">
                                    <button className="text-indigo-600 text-xs font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
