import { Comment } from '@/types/models';

// Helper to update comment in state
export const updateCommentInList = (commentList: Comment[], commentId: string, updates: Partial<Comment>): Comment[] => {
    return commentList.map(comment => {
        if (comment.id === commentId) {
            return { ...comment, ...updates };
        }
        if (comment.replies) {
            return { ...comment, replies: updateCommentInList(comment.replies, commentId, updates) };
        }
        return comment;
    });
};

// Helper to remove comment from state
export const removeCommentFromList = (commentList: Comment[], commentId: string): Comment[] => {
    return commentList.reduce((acc: Comment[], comment) => {
        if (comment.id === commentId) {
            return acc;
        }

        if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = removeCommentFromList(comment.replies, commentId);
            if (updatedReplies.length !== comment.replies.length) {
                // A reply was removed from this comment
                acc.push({
                    ...comment,
                    replies: updatedReplies,
                    replyCount: Math.max(0, (comment.replyCount || 0) - (comment.replies.length - updatedReplies.length))
                });
                return acc;
            }
        }

        acc.push(comment);
        return acc;
    }, []);
};

// Helper to add reply to state
export const addReplyToList = (commentList: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return commentList.map(comment => {
        if (comment.id === parentId) {
            const currentReplies = comment.replies || [];
            return {
                ...comment,
                replies: [...currentReplies, newReply],
                replyCount: (comment.replyCount || 0) + 1
            };
        }
        if (comment.replies) {
            return { ...comment, replies: addReplyToList(comment.replies, parentId, newReply) };
        }
        return comment;
    });
};

// Helper to find comment by ID in nested structure
export const findCommentById = (commentList: Comment[], id: string): Comment | null => {
    for (const comment of commentList) {
        if (comment.id === id) return comment;
        if (comment.replies) {
            const found = findCommentById(comment.replies, id);
            if (found) return found;
        }
    }
    return null;
};

// Helper to update comment replies
export const updateCommentRepliesInList = (commentList: Comment[], commentId: string, replies: Comment[]): Comment[] => {
    return commentList.map(comment => {
        if (comment.id === commentId) {
            return { ...comment, replies };
        }
        if (comment.replies) {
            return { ...comment, replies: updateCommentRepliesInList(comment.replies, commentId, replies) };
        }
        return comment;
    });
};
