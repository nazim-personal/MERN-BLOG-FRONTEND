import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { getErrorMessage } from '@/lib/error-utils';
import { ApiResponse } from '@/types/api';
import { Comment } from '@/types/models';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api/v1';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const response = await axios.get<ApiResponse<Comment[]>>(`${BACKEND_URL}/comments`, {
      params: Object.fromEntries(searchParams.entries()),
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
    return NextResponse.json(
      { message, success: false },
      { status }
    );
  }
}
