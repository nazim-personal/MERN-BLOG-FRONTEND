export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    created_at: string;
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
    created_at: string;
    updated_at: string;
}

export interface Comment {
    id: string;
    content: string;
    author: {
        id?: string;
        name: string;
        email: string;
    };
    post: {
        id: string;
        title: string;
    };
    created_at: string;
    updated_at: string;
}

export interface AdminStats {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
}
