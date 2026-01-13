'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { Comment, Post } from '@/types/models';
import { Check, Edit3, Eye, FileText, Mail, MessageSquare, Plus, Trash2, User as UserIcon, Users as UsersIcon, X } from 'lucide-react';
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
    const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [commentPagination, setCommentPagination] = useState({ page: 1, totalPages: 1, hasMore: false });

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

    const fetchComments = async (postId?: string, page = 1, append = false) => {
        setIsLoading(true);
        try {
            const url = postId ? `/api/posts/${postId}/comments` : '/api/comments';
            const response = await axios.get<ApiResponse<Comment[]>>(url, {
                params: { page, limit: 10 }
            });
            if (response.data.success) {
                if (append) {
                    setComments(prev => [...prev, ...response.data.data]);
                } else {
                    setComments(response.data.data);
                }
                setCommentPagination({
                    page: response.data.pagination?.page || 1,
                    totalPages: response.data.pagination?.pages || 1,
                    hasMore: (response.data.pagination?.page || 1) < (response.data.pagination?.pages || 1)
                });
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMoreComments = () => {
        if (viewingPost && commentPagination.hasMore) {
            fetchComments(viewingPost.id, commentPagination.page + 1, true);
        }
    };

    useEffect(() => {
        if (activeTab === 'posts') {
            fetchPosts();
        }
    }, [activeTab]);

    useEffect(() => {
        if (viewingPost) {
            fetchComments(viewingPost.id);
        }
    }, [viewingPost]);

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

    const handleDeleteComment = (id: string) => {
        setCommentToDelete(id);
        setIsDeleteCommentModalOpen(true);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;
        setIsLoading(true);
        try {
            const response = await axios.delete<ApiResponse<null>>(`/api/comments/${commentToDelete}`);
            if (response.data.success) {
                toast.success(response.data.message || 'Comment deleted successfully');
                if (viewingPost) {
                    fetchComments(viewingPost.id);
                } else {
                    fetchComments();
                }
                setIsDeleteCommentModalOpen(false);
                setCommentToDelete(null);
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    const confirmUpdateComment = async (id: string) => {
        if (!editingCommentContent.trim()) return;
        setIsLoading(true);
        try {
            const response = await axios.put<ApiResponse<Comment>>(`/api/comments/${id}`, {
                content: editingCommentContent
            });
            if (response.data.success) {
                toast.success('Comment updated successfully');
                setEditingCommentId(null);
                setEditingCommentContent('');
                if (viewingPost) {
                    fetchComments(viewingPost.id);
                }
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewingPost || !newComment.trim()) return;

        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse<Comment>>(`/api/posts/${viewingPost.id}/comments`, {
                content: newComment
            });
            if (response.data.success) {
                toast.success('Comment added successfully');
                setNewComment('');
                fetchComments(viewingPost.id);
            }
        } catch (error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
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
                                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                                                <button
                                                    onClick={() => setViewingPost(post)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="View Post"
                                                >
                                                    <Eye size={18} />
                                                </button>
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
            </div>

            {/* View Post Modal */}
            {viewingPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Post Details</h3>
                            <button
                                onClick={() => setViewingPost(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">{viewingPost.title}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    <span className="flex items-center gap-1">
                                        <UserIcon size={16} />
                                        {viewingPost.author.name}
                                    </span>
                                    <span>{new Date(viewingPost.createdAt).toLocaleDateString()}</span>
                                    {viewingPost.tags && viewingPost.tags.length > 0 && (
                                        <div className="flex gap-1">
                                            {viewingPost.tags.map((tag, index) => (
                                                <span key={index} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="prose max-w-none text-gray-700">
                                    {viewingPost.content}
                                </div>
                            </div>

                            <hr className="border-gray-100 my-8" />

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MessageSquare size={20} />
                                    Comments
                                </h3>

                                {permissions.includes('comments:create') && (
                                    <form onSubmit={handleAddComment} className="mb-8">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <textarea
                                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none text-gray-700 min-h-[100px]"
                                                    placeholder="Write a comment..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                isLoading={isLoading}
                                                className="h-fit px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200"
                                            >
                                                Post
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-4">
                                    {comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                                    {comment.author.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{comment.author.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                                {new Date(comment.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {editingCommentId === comment.id ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => confirmUpdateComment(comment.id)}
                                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                        title="Save"
                                                                    >
                                                                        <Check size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingCommentId(null);
                                                                            setEditingCommentContent('');
                                                                        }}
                                                                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                                                        title="Cancel"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {(permissions.includes('comments:manage:all') || (permissions.includes('comments:edit:own') && comment.author.email === userEmail)) && (
                                                                        <button
                                                                            onClick={() => handleUpdateComment(comment)}
                                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit3 size={14} />
                                                                        </button>
                                                                    )}
                                                                    {(permissions.includes('comments:manage:all') || (permissions.includes('comments:delete:own') && comment.author.email === userEmail)) && (
                                                                        <button
                                                                            onClick={() => handleDeleteComment(comment.id)}
                                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {editingCommentId === comment.id ? (
                                                        <textarea
                                                            className="w-full p-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm text-gray-700 min-h-[80px]"
                                                            value={editingCommentContent}
                                                            onChange={(e) => setEditingCommentContent(e.target.value)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                            <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
                                            <p className="text-gray-400 italic text-sm">No comments yet. Be the first to share your thoughts!</p>
                                        </div>
                                    )}
                                    {commentPagination.hasMore && (
                                        <div className="pt-4 flex justify-center">
                                            <Button
                                                variant="outline"
                                                onClick={handleLoadMoreComments}
                                                isLoading={isLoading}
                                                className="px-8 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs uppercase tracking-widest"
                                            >
                                                Load More Comments
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Delete Post Confirmation Modal */}
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

            {/* Delete Comment Confirmation Modal */}
            {isDeleteCommentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Comment?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete this comment? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDeleteCommentModalOpen(false)}
                                    className="px-6 rounded-xl border-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    isLoading={isLoading}
                                    onClick={confirmDeleteComment}
                                    className="px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
