import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { Post } from '@/types/models';
import { Edit3, Eye, FileText, Plus, Trash2, User as UserIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CommentsSection } from '@/components/dashboard/CommentsSection';
import { PostSkeleton } from '@/components/ui/SkeletonLoader';
import { validatePostTitle, validatePostContent, validateTags } from '@/lib/validation';

interface PostsTabProps {
    userName: string;
    userEmail: string;
    permissions: string[];
}

export function PostsTab({ userName, userEmail, permissions }: PostsTabProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [postFormData, setPostFormData] = useState({ title: '', content: '', status: 'published', tags: [] as string[] });
    const [tagInput, setTagInput] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<ApiResponse<Post[]>>('/posts');
            if (response.data.success) {
                setPosts(response.data.data);
            }
        } catch (_error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDeletePost = (id: string) => {
        setPostToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        setIsLoading(true);
        try {
            const response = await axios.delete<ApiResponse<null>>(`/posts/${postToDelete}`);
            if (response.data.success) {
                toast.success(response.data.message || 'Post deleted successfully');
                fetchPosts();
                setIsDeleteModalOpen(false);
                setPostToDelete(null);
            }
        } catch (_error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const titleError = validatePostTitle(postFormData.title);
        if (titleError) {
            toast.error(titleError);
            setIsLoading(false);
            return;
        }

        const contentError = validatePostContent(postFormData.content);
        if (contentError) {
            toast.error(contentError);
            setIsLoading(false);
            return;
        }

        const tagsError = validateTags(postFormData.tags);
        if (tagsError) {
            toast.error(tagsError);
            setIsLoading(false);
            return;
        }

        try {
            if (editingPost) {
                const response = await axios.put<ApiResponse<Post>>(`/posts/${editingPost.id}`, postFormData);
                if (response.data.success) {
                    toast.success(response.data.message || 'Post updated successfully');
                    setIsModalOpen(false);
                    setEditingPost(null);
                    setPostFormData({ title: '', content: '', status: 'published', tags: [] });
                    fetchPosts();
                }
            } else {
                const response = await axios.post<ApiResponse<Post>>('/posts', postFormData);
                if (response.data.success) {
                    toast.success(response.data.message || 'Post created successfully');
                    setIsModalOpen(false);
                    setEditingPost(null);
                    setPostFormData({ title: '', content: '', status: 'published', tags: [] });
                    fetchPosts();
                }
            }
        } catch (_error: unknown) {
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

    return (
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

            {isLoading && !posts.length ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                        <PostSkeleton key={i} />
                    ))}
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
                                            {post.author?.name || 'Unknown Author'}
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
                                    {(permissions.includes('posts:manage:all') || (permissions.includes('posts:edit:own') && post.author?.email === userEmail)) && (
                                        <button
                                            onClick={() => openEditModal(post)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Edit Post"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                    )}
                                    {(permissions.includes('posts:manage:all') || (permissions.includes('posts:delete:own') && post.author?.email === userEmail)) && (
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

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handlePostSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                    <Input
                                        value={postFormData.title}
                                        onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                                        placeholder="Enter post title"
                                        required
                                        className="bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                                    <textarea
                                        value={postFormData.content}
                                        onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                                        placeholder="Write your content here..."
                                        required
                                        className="w-full h-40 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                                        {postFormData.tags.map((tag, index) => (
                                            <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-bold flex items-center gap-1">
                                                #{tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            placeholder={postFormData.tags.length === 0 ? "Type tag and press Enter" : ""}
                                            className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400 min-w-[120px]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={postFormData.status}
                                        onChange={(e) => setPostFormData({ ...postFormData, status: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium text-gray-900"
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-gray-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {editingPost ? 'Update Post' : 'Publish Post'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200 text-center">
                        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Post?</h3>
                        <p className="text-gray-500 mb-8">Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="border-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDeletePost}
                                isLoading={isLoading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete Post
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                                        {viewingPost.author?.name || 'Unknown Author'}
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

                            <CommentsSection
                                postId={viewingPost.id}
                                userEmail={userEmail}
                                permissions={permissions}
                                userName={userName}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
