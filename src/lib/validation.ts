export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 100) return 'Name cannot exceed 100 characters';
  return null;
};

export const validatePostTitle = (title: string): string | null => {
    if (!title) return 'Title is required';
    const trimmed = title.trim();
    if (trimmed.length < 3) return 'Title must be at least 3 characters long';
    if (trimmed.length > 200) return 'Title cannot exceed 200 characters';
    return null;
};

export const validatePostContent = (content: string): string | null => {
    if (!content) return 'Content is required';
    if (content.length < 10) return 'Content must be at least 10 characters long';
    if (content.length > 100000) return 'Content cannot exceed 100,000 characters';
    return null;
};

export const validateTags = (tags: string[]): string | null => {
    if (tags.length > 20) return 'Cannot have more than 20 tags';
    for (const tag of tags) {
        const trimmed = tag.trim();
        if (trimmed.length < 1) return 'Tag cannot be empty';
        if (trimmed.length > 50) return 'Tag cannot exceed 50 characters';
    }
    return null;
};

export const validateCommentContent = (content: string): string | null => {
    if (!content) return 'Content is required';
    const trimmed = content.trim();
    if (trimmed.length < 1) return 'Content cannot be empty';
    if (trimmed.length > 5000) return 'Content cannot exceed 5,000 characters';
    return null;
};

export interface ValidationErrors {
  [key: string]: string | undefined;
}
