import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { getErrorMessage } from '@/lib/error-utils';
import { ApiResponse } from '@/types/api';
import { Post } from '@/types/models';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await axios.get<ApiResponse<Post>>(`${BACKEND_URL}/posts/${id}`);
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const { id } = await params;
    console.log('params id: ', id);

    const body = await request.json();
    const response = await axios.put<ApiResponse<Post>>(`${BACKEND_URL}/posts/${id}`, body, {
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 });
    }

    const { id } = await params;
    const response = await axios.delete<ApiResponse<null>>(`${BACKEND_URL}/posts/${id}`, {
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
