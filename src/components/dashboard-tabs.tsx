'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { Comment, Post } from '@/types/models';
import { Edit3, FileText, Mail, MessageSquare, Plus, Trash2, User as UserIcon, Users as UsersIcon, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

interface DashboardTabsProps {
    userName: string;
    userEmail: string;
    permissions: string[];
}

export function DashboardTabs({ userName, userEmail, permissions }: DashboardTabsProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [postFormData, setPostFormData] = useState({ title: '', content: '', status: 'published', tags: [] as string[] });
    const [tagInput, setTagInput] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<ApiResponse<Post[]>>('/api/posts');
            if (response.data.success) {
                setPosts(response.data.data);
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<ApiResponse<Comment[]>>('/api/comments');
            if (response.data.success) {
                setComments(response.data.data);
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'posts') {
            fetchPosts();
        } else if (activeTab === 'comments') {
            fetchComments();
        }
    }, [activeTab]);

    const handleDeletePost = (id: string) => {
        setPostToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        setIsLoading(true);
        try {
            const response = await axios.delete<ApiResponse<null>>(`/api/posts/${postToDelete}`);
            if (response.data.success) {
                toast.success(response.data.message || 'Post deleted successfully');
                fetchPosts();
                setIsDeleteModalOpen(false);
                setPostToDelete(null);
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            const response = await axios.delete<ApiResponse<null>>(`/api/comments/${id}`);
            if (response.data.success) {
                toast.success(response.data.message || 'Comment deleted successfully');
                fetchComments();
            }
        } catch (error: unknown) {
            // Non-API error
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingPost) {
                console.log('editingPost: ', editingPost);

                const response = await axios.put<ApiResponse<Post>>(`/api/posts/${editingPost.id}`, postFormData);
                if (response.data.success) {
                    toast.success(response.data.message || 'Post updated successfully');
                    setIsModalOpen(false);
                    setEditingPost(null);
                    setPostFormData({ title: '', content: '', status: 'published', tags: [] });
                    fetchPosts();
                }
            } else {
                const response = await axios.post<ApiResponse<Post>>('/api/posts', postFormData);
                if (response.data.success) {
                    toast.success(response.data.message || 'Post created successfully');
                    setIsModalOpen(false);
                    setEditingPost(null);
                    setPostFormData({ title: '', content: '', status: 'published', tags: [] });
                    fetchPosts();
                }
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const openEditModal = (post: Post) => {
        setEditingPost(post);
        setPostFormData({ title: post.title, content: post.content, status: post.status, tags: post.tags || [] });
        setTagInput('');
        setIsModalOpen(true);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.trim();
            if (tag && !postFormData.tags.includes(tag)) {
                setPostFormData({
                    ...postFormData,
                    tags: [...postFormData.tags, tag]
                });
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setPostFormData({
            ...postFormData,
            tags: postFormData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const tabs = useMemo(() => {
        const allTabs = [
            { id: 'profile', label: 'Profile', icon: UserIcon, permission: 'posts:view' }, // Everyone can see profile
            { id: 'posts', label: 'Posts', icon: FileText, permission: 'posts:view' },
            { id: 'users', label: 'Users', icon: UsersIcon, permission: 'users:view' },
            { id: 'comments', label: 'Comments', icon: MessageSquare, permission: 'comments:manage:all' },
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
                    <div className="p-8 transition-all duration-500 opacity-100 translate-y-0">
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {userName.charAt(0).toUpperCase()}
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
                )}

                {activeTab === 'posts' && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
                            {permissions.includes('posts:create') && (
                                <button
                                    onClick={() => {
                                        setEditingPost(null);
                                        setPostFormData({ title: '', content: '', status: 'published', tags: [] });
                                        setTagInput('');
                                        setIsModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                                >
                                    <Plus size={18} />
                                    Create New Post
                                </button>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="p-6 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                                                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <UserIcon size={12} />
                                                        {post.author.name}
                                                    </span>
                                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                    <span className={`px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {post.status}
                                                    </span>
                                                    {post.tags && post.tags.length > 0 && (
                                                        <div className="flex gap-1 flex-wrap">
                                                            {post.tags.map((tag, index) => (
                                                                <span key={index} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(permissions.includes('posts:manage:all') || (permissions.includes('posts:edit:own') && post.author.email === userEmail)) && (
                                                    <button
                                                        onClick={() => openEditModal(post)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Edit Post"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                )}
                                                {(permissions.includes('posts:manage:all') || (permissions.includes('posts:delete:own') && post.author.email === userEmail)) && (
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-500">
                                <FileText size={48} className="text-gray-200 mb-4" />
                                <p className="italic">No posts found. Start sharing your thoughts!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
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
                                    <tr className="group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    JD
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">John Doe</p>
                                                    <p className="text-xs text-gray-500">john@example.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded-md">Admin</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-2"></span>
                                            <span className="text-xs text-gray-600">Active</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button className="text-indigo-600 text-xs font-bold hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Moderation</h2>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="p-6 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-gray-900">{comment.author.name}</span>
                                                    <span className="text-xs text-gray-400">on</span>
                                                    <span className="text-xs font-medium text-indigo-600">{comment.post.title}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 italic">&quot;{comment.content}&quot;</p>
                                                <p className="text-xs text-gray-400 mt-2">{new Date(comment.created_at).toLocaleDateString()}</p>
                                            </div>
                                            {permissions.includes('comments:manage:all') && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Comment"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-500">
                                <MessageSquare size={48} className="text-gray-200 mb-4" />
                                <p className="italic">All caught up! No pending comments to review.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingPost ? 'Edit Post' : 'Create New Post'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handlePostSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <Input
                                    label="Post Title"
                                    placeholder="Enter a catchy title..."
                                    value={postFormData.title}
                                    onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                                    required
                                />
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Content</label>
                                    <textarea
                                        className="w-full min-h-[200px] p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none text-gray-700"
                                        placeholder="Write your thoughts here..."
                                        value={postFormData.content}
                                        onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Status</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-700 appearance-none"
                                        value={postFormData.status}
                                        onChange={(e) => setPostFormData({ ...postFormData, status: e.target.value })}
                                    >
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Tags</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                                        {postFormData.tags.map((tag, index) => (
                                            <span key={index} className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-indigo-900 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent outline-none text-sm text-gray-700 min-w-[120px]"
                                            placeholder={postFormData.tags.length === 0 ? "Type and press Enter to add tags..." : "Add tag..."}
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 rounded-xl border-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200"
                                >
                                    {editingPost ? 'Update Post' : 'Create Post'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Post?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-6 rounded-xl border-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    isLoading={isLoading}
                                    onClick={confirmDeletePost}
                                    className="px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
