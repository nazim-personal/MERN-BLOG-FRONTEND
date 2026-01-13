import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  try {
    if (refreshToken) {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api/v1';

      // Call Backend Logout API
      await axios.post(`${backendUrl}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });
    }
  } catch (error) {
    console.error('Backend logout failed:', error);
    // We continue to clear cookies even if backend fails to ensure local logout
  }

  // Clear local cookies
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('userName');
  cookieStore.delete('userEmail');

  return NextResponse.json({ message: 'Logged out successfully', success: true });
}
