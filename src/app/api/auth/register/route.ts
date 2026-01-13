import { NextResponse } from 'next/server';
import axios from 'axios';
import { getErrorMessage } from '@/lib/error-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api';

    // Call Backend API
    const response = await axios.post(`${backendUrl}/auth/register`, { name, email, password });

    const { message, success, data } = response.data;

    if (!success) {
      return NextResponse.json(
        { message: message || 'Registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message, success, data });

  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = getErrorMessage(error);

    let status = 500;
    if (axios.isAxiosError(error) && error.response) {
      status = error.response.status;
    }

    return NextResponse.json(
      { message },
      { status }
    );
  }
}
