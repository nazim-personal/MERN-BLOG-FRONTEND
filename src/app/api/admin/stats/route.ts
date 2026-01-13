import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { getErrorMessage } from '@/lib/error-utils';
import { ApiResponse } from '@/types/api';
import { AdminStats, User, Post, Comment } from '@/types/models';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api/v1';

    // Fetch Users
    const usersResponse = await axios.get<ApiResponse<User[]>>(`${backendUrl}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Fetch Posts
    const postsResponse = await axios.get<ApiResponse<Post[]>>(`${backendUrl}/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Fetch Comments (Assuming /api/comments exists based on permissions)
    let commentsCount = 0;
    try {
      const commentsResponse = await axios.get<ApiResponse<Comment[]>>(`${backendUrl}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      commentsCount = commentsResponse.data.pagination?.total || commentsResponse.data.data?.length || 0;
    } catch (e: unknown) {
      console.warn('Comments endpoint failed or not found', e);
      // Fallback to 0 if endpoint doesn't exist
    }

    const totalUsers = usersResponse.data.data?.length || 0;
    const totalPosts = postsResponse.data.pagination?.total || postsResponse.data.data?.length || 0;

    const stats: AdminStats = {
      totalUsers,
      totalPosts,
      totalComments: commentsCount
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
    return NextResponse.json(
      { message, success: false },
      { status }
    );
  }
}
