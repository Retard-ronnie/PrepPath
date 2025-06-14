interface AuthError {
  code: string;
  message: string;
}

export const handleAuthError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/popup-closed-by-user':
        // User closed the popup, no need to show error
        return '';
      default:
        return `Authentication error: ${authError.message}`;
    }
  } else {
    console.error(error);
    return 'An unexpected error occurred';
  }
};