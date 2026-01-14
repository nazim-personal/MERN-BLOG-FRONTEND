export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    createdAt: string;
    deletedAt?: string;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    status: 'published' | 'draft';
    tags: string[];
    author: {
        id?: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface Comment {
    id: string;
    content: string;
    author: {
        id?: string;
        name: string;
        email: string;
    };
    post?: {
        id: string;
        title: string;
    };
    parentId?: string;
    replies?: Comment[];
    replyCount?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface AdminStats {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
}
