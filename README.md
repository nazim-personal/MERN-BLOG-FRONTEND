# MERN Blog Frontend

A modern, responsive, and feature-rich blog application frontend built with the MERN stack (MongoDB, Express, React/Next.js, Node.js).

## 🚀 Features

-   **User Authentication**: Secure sign-up and sign-in with JWT and HTTP-only cookies.
-   **Social Login**: Integrated Google and Facebook login.
-   **Role-Based Access Control (RBAC)**: Granular permissions for Admin and User roles.
-   **Dashboard**:
    -   **Profile Management**: View and update user profile.
    -   **Post Management**: Create, edit, delete, and view posts (with rich text support).
    -   **User Management**: Admin interface to manage users (view, edit roles).
-   **Comments System**: Nested comments (replies), editing, and deletion.
-   **Responsive Design**: Fully responsive UI built with Tailwind CSS.
-   **Performance Optimized**:
    -   Code splitting and lazy loading.
    -   API response caching and request deduplication.
    -   Optimized assets and skeleton loaders.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State Management**: React Hooks (useState, useEffect, useMemo)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
-   **Linting/Formatting**: ESLint, Prettier

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd MERN-BLOG-FRONTEND
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add the following variables:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3018/api/v1
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Scripts

-   `npm run dev`: Runs the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Runs ESLint to check for code quality issues.

## 🔌 API Documentation Overview

The frontend interacts with a backend API. Key endpoints include:

### Authentication
-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/signin`: Sign in an existing user.
-   `POST /api/auth/logout`: Sign out the current user.
-   `GET /api/auth/me`: Get current user profile.

### Posts
-   `GET /api/posts`: Fetch all posts (supports pagination).
-   `POST /api/posts`: Create a new post.
-   `GET /api/posts/:id`: Get a specific post.
-   `PUT /api/posts/:id`: Update a post.
-   `DELETE /api/posts/:id`: Delete a post.

### Comments
-   `GET /api/posts/:postId/comments`: Get comments for a post.
-   `POST /api/posts/:postId/comments`: Add a comment to a post.
-   `PUT /api/comments/:id`: Update a comment.
-   `DELETE /api/comments/:id`: Delete a comment.

## 🏗️ Project Structure

```
src/
├── app/                # Next.js App Router pages and API routes
├── components/         # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components (PostsTab, ProfileTab, etc.)
│   └── ui/             # Generic UI components (Button, Input, SkeletonLoader, etc.)
├── lib/                # Utility functions (axios, api-cache, validation, etc.)
├── types/              # TypeScript type definitions (models, api, etc.)
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
