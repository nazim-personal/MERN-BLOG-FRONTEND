import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import axios from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { Comment } from '@/types/models';
import { Check, ChevronDown, Edit3, MessageSquare, Reply, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateCommentInList, removeCommentFromList, addReplyToList, findCommentById, updateCommentRepliesInList } from '@/lib/comment-helpers';
import { CommentSkeleton } from '@/components/ui/SkeletonLoader';
import { validateCommentContent } from '@/lib/validation';

interface CommentsSectionProps {
    postId: string;
    userEmail: string;
    permissions: string[];
    userName: string; // Current user's name
}

export function CommentsSection({ postId, userEmail, permissions, userName }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [commentPagination, setCommentPagination] = useState({ page: 1, totalPages: 1, hasMore: false });
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

    const fetchComments = useCallback(async (page = 1, append = false, nested = false) => {
        setIsLoading(true);
        try {
            const url = `/posts/${postId}/comments`;
            const response = await axios.get<ApiResponse<Comment[]>>(url, {
                params: { page, limit: 10, nested: nested.toString() }
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
        } catch (_error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleLoadMoreComments = () => {
        if (commentPagination.hasMore) {
            fetchComments(commentPagination.page + 1, true);
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
            const response = await axios.delete<ApiResponse<null>>(`/comments/${commentToDelete}`);
            if (response.data.success) {
                toast.success(response.data.message || 'Comment deleted successfully');
                setComments(prev => removeCommentFromList(prev, commentToDelete));
                setIsDeleteCommentModalOpen(false);
                setCommentToDelete(null);
            }
        } catch (_error: unknown) {
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
        const contentError = validateCommentContent(editingCommentContent);
        if (contentError) {
            toast.error(contentError);
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.put<ApiResponse<Comment>>(`/comments/${id}`, {
                content: editingCommentContent
            });
            if (response.data.success) {
                toast.success('Comment updated successfully');
                setComments(prev => updateCommentInList(prev, id, { content: editingCommentContent }));
                setEditingCommentId(null);
                setEditingCommentContent('');
            }
        } catch (_error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const toggleReplies = async (commentId: string) => {
        const newExpanded = new Set(expandedComments);

        if (newExpanded.has(commentId)) {
            // Collapse - just remove from expanded set
            newExpanded.delete(commentId);
            setExpandedComments(newExpanded);
        } else {
            // Expand - fetch replies if not already loaded
            newExpanded.add(commentId);
            setExpandedComments(newExpanded);

            // Check if we need to fetch replies
            const comment = findCommentById(comments, commentId);
            if (comment && (!comment.replies || comment.replies.length === 0) && comment.replyCount && comment.replyCount > 0) {
                const newLoading = new Set(loadingReplies);
                newLoading.add(commentId);
                setLoadingReplies(newLoading);

                try {
                    const response = await axios.get<ApiResponse<Comment[]>>(`/comments/${commentId}/replies`);
                    if (response.data.success) {
                        // Update the comment with fetched replies
                        setComments(prev => updateCommentRepliesInList(prev, commentId, response.data.data));
                    }
                } catch (_error: unknown) {
                    toast.error('Failed to load replies');
                } finally {
                    const updatedLoading = new Set(loadingReplies);
                    updatedLoading.delete(commentId);
                    setLoadingReplies(updatedLoading);
                }
            }
        }
    };

    const handleAddComment = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault();
        const content = parentId ? replyContent : newComment;

        const contentError = validateCommentContent(content);
        if (contentError) {
            toast.error(contentError);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, {
                content,
                parentId
            });
            if (response.data.success) {
                toast.success(parentId ? 'Reply added successfully' : 'Comment added successfully');

                const newCommentData = response.data.data;

                // Ensure author info is present for the UI
                const authorInfo = {
                    id: typeof newCommentData.author === 'object' ? newCommentData.author?.id : (typeof newCommentData.author === 'string' ? newCommentData.author : undefined),
                    name: (typeof newCommentData.author === 'object' ? newCommentData.author?.name : undefined) || userName,
                    email: (typeof newCommentData.author === 'object' ? newCommentData.author?.email : undefined) || userEmail
                };

                const commentWithAuthor = {
                    ...newCommentData,
                    author: authorInfo
                };

                if (parentId) {
                    setReplyContent('');
                    setReplyingToId(null);
                    // Add reply to state locally
                    setComments(prev => addReplyToList(prev, parentId, commentWithAuthor));
                    // Expand the parent comment to show the new reply
                    const newExpanded = new Set(expandedComments);
                    newExpanded.add(parentId);
                    setExpandedComments(newExpanded);
                } else {
                    setNewComment('');
                    // For top-level comments, we can just prepend to the list
                    setComments(prev => [commentWithAuthor, ...prev]);
                }
            }
        } catch (_error: unknown) {
            // Non-API error
        } finally {
            setIsLoading(false);
        }
    };

    const renderComment = (comment: Comment, depth = 0) => (
        <div key={comment.id} className={`${depth > 0 ? 'ml-12 mt-4' : ''}`}>
            <div className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                    {comment.author?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{comment.author?.name || 'Unknown User'}</span>
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
                                    {permissions.includes('comments:create') && depth < 3 && (
                                        <button
                                            onClick={() => {
                                                setReplyingToId(comment.id);
                                                setReplyContent('');
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Reply"
                                        >
                                            <Reply size={14} />
                                        </button>
                                    )}
                                    {(permissions.includes('comments:manage:all') || (permissions.includes('comments:edit:own') && comment.author?.email === userEmail)) && (
                                        <button
                                            onClick={() => handleUpdateComment(comment)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                    )}
                                    {(permissions.includes('comments:manage:all') || (permissions.includes('comments:delete:own') && comment.author?.email === userEmail)) && (
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
                        <>
                            <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                            {comment.replyCount !== undefined && comment.replyCount > 0 && (
                                <button
                                    onClick={() => toggleReplies(comment.id)}
                                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2 transition-colors hover:underline"
                                >
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform duration-200 ${expandedComments.has(comment.id) ? 'rotate-180' : ''}`}
                                    />
                                    {expandedComments.has(comment.id) ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                    {loadingReplies.has(comment.id) && (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-indigo-600 ml-1"></div>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {replyingToId === comment.id && (
                <div className="ml-12 mt-4">
                    <form onSubmit={(e) => handleAddComment(e, comment.id)} className="flex gap-4">
                        <div className="flex-1">
                            <textarea
                                className="w-full p-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm text-gray-700 min-h-[80px]"
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="h-fit px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
                            >
                                Reply
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReplyingToId(null)}
                                className="h-fit px-4 py-2 rounded-xl text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {expandedComments.has(comment.id) && comment.replies && (
                <div className="mt-4">
                    {comment.replies.map(reply => renderComment(reply, depth + 1))}
                </div>
            )}
        </div>
    );

    return (
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
                {isLoading && !comments.length ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <CommentSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    comments.map(comment => renderComment(comment))
                )}
            </div>

            {commentPagination.hasMore && (
                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={handleLoadMoreComments}
                        isLoading={isLoading}
                        className="border-gray-200 text-gray-600"
                    >
                        Load More Comments
                    </Button>
                </div>
            )}

            {/* Delete Comment Confirmation Modal */}
            {isDeleteCommentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200 text-center">
                        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Comment?</h3>
                        <p className="text-gray-500 mb-8">Are you sure you want to delete this comment? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteCommentModalOpen(false)}
                                className="border-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDeleteComment}
                                isLoading={isLoading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete Comment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
