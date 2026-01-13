import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header if token exists (client-side)
// Note: For httpOnly cookies, the browser handles sending cookies automatically to the same domain (Next.js API).
// If this axios instance is used to call Next.js API routes, we don't need to manually add the token if it's in a cookie.
// However, if we are calling the external backend directly from client (not recommended for httpOnly), we would need it.
// Since the plan is Client -> Next.js API -> Backend, the Client just calls Next.js API.
// The Next.js API will handle the token.
// So this axios instance is primarily for Client -> Next.js API calls.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Extract error message
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    // Handle 401 Unauthorized (Token Expired or Invalid)
    if (error.response?.status === 401) {
      // Only redirect on client side
      if (typeof window !== 'undefined') {
        // Prevent infinite loops if the logout endpoint itself returns 401
        if (!window.location.pathname.includes('/signin')) {
          try {
            // Call logout endpoint to clear cookies
            await axios.post('/api/auth/logout');
            toast.error('Session expired. Please sign in again.');
            // Redirect to signin
            window.location.href = '/signin';
          } catch (logoutError) {
            console.error('Logout failed during 401 handling:', logoutError);
            // Force redirect even if logout fails
            window.location.href = '/signin';
          }
          // Return a resolved promise to prevent further error handling for this request
          return Promise.resolve({ success: false, message: 'Session expired' });
        }
      }
    }

    // Show toast for all errors (400, 401, 500, etc.)
    // We avoid showing multiple toasts if the page also handles it
    // But since we want "global" handling, we do it here.
    toast.error(message);

    // Instead of rejecting, we resolve with the error response data
    // This prevents the "crash" (throw) in the calling code.
    // We ensure the returned object has a 'success: false' flag.
    return Promise.resolve({
      ...error.response,
      data: {
        ...(error.response?.data || {}),
        success: false,
        message: message
      }
    });
  }
);

export default api;
