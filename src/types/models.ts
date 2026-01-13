export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    createdAt: string;
}

export interface Post {
    _id: string;
    title: string;
    content: string;
    status: 'published' | 'draft';
    tags: string[];
    author: {
        _id?: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    content: string;
    author: {
        _id?: string;
        name: string;
        email: string;
    };
    post: {
        _id: string;
        title: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AdminStats {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
}
