import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { accessToken, refreshToken } = body;

        if (!accessToken || !refreshToken) {
            return NextResponse.json(
                { message: 'Tokens are required' },
                { status: 400 }
            );
        }

        // Verify tokens or get user info if needed.
        // For now, we trust the tokens passed from the client-side callback
        // (which came from the backend redirect).
        // Ideally, we might want to validate them with the backend again or decode them.

        // Let's decode to get user info for cookies if possible, or just set the tokens.
        // Since we don't have the user object here, we might miss setting 'userName', 'userRole' etc.
        // causing the UI to not show the user details immediately.
        // A better approach would be to fetch the user profile using the access token.

        // Fetch user profile to populate other cookies
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3018/api/v1';

        let user = null;
        try {
            const profileResponse = await axios.get(`${backendUrl}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (profileResponse.data.success) {
                user = profileResponse.data.data;
            }
        } catch (err) {
            console.error('Failed to fetch user profile during social login:', err);
        }

        const cookieStore = await cookies();

        cookieStore.set({
            name: 'accessToken',
            value: accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        // Refresh Token Cookie
        cookieStore.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        // User Info Cookies
        if (user) {
            if (user.name) {
                cookieStore.set({
                    name: 'userName',
                    value: user.name,
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
            }
            if (user.email) {
                cookieStore.set({
                    name: 'userEmail',
                    value: user.email,
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
            }
            if (user.role) {
                cookieStore.set({
                    name: 'userRole',
                    value: user.role,
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
            }
            if (user.permissions) {
                cookieStore.set({
                    name: 'userPermissions',
                    value: JSON.stringify(user.permissions),
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Social login success handler error:', error);
        return NextResponse.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}
