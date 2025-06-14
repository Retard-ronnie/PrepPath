# Authentication Implementation Guide

This guide explains how to implement user authentication in PrepPath, covering both backend functionality and frontend components.

## Authentication Flow

PrepPath uses Firebase Authentication with a custom implementation layer:

1. User signs up or logs in (Email/Password or Google OAuth)
2. Firebase authenticates the user
3. User data is stored/retrieved from Firestore
4. Auth state is maintained through context

## Authentication Context

The authentication system is built around a React Context that provides authentication state to the entire application.

### Context Setup

The authentication context is defined in `src/context/AuthProvider.tsx`:

```typescript
// Context Type
export interface AuthContextType {
  user: User | null;          // Firebase user object
  userData: UserType | null;  // User data from Firestore
  loading: boolean;           // Loading state
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Context Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Authentication methods...
  
  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getUser(firebaseUser.uid);
        setUserData(userDoc);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Context value
  const value = {
    user,
    userData,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Using the Auth Hook

The `useAuth` hook provides access to the authentication context:

```typescript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { 
    user,           // Firebase user object
    userData,       // User data from Firestore
    loading,        // Loading state
    login,          // Email/password login function
    signup,         // Email/password signup function
    loginWithGoogle, // Google login function
    logout,         // Logout function
    error           // Authentication error
  } = useAuth();
  
  // Use auth state and methods...
}
```

## Implementing Authentication Methods

### 1. Email/Password Signup

```typescript
const signup = async (name: string, email: string, password: string) => {
  try {
    setError(null);
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    // Create user document in Firestore
    const timestamp = Date.now();
    await createUser(userCredential.user.uid, {
      uid: userCredential.user.uid,
      name,
      email,
      createdAt: timestamp,
      updatedAt: timestamp,
      authProvider: 'email'
    });
  } catch (error) {
    handleAuthError(error);
  }
};
```

### 2. Email/Password Login

```typescript
const login = async (email: string, password: string) => {
  try {
    setError(null);
    await signInWithEmailAndPassword(auth, email, password);
    // User state will be updated by the auth state observer
  } catch (error) {
    handleAuthError(error);
  }
};
```

### 3. Google OAuth Login

```typescript
const loginWithGoogle = async () => {
  try {
    setError(null);
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user exists in Firestore
    const userDoc = await getUser(result.user.uid);
    
    if (!userDoc) {
      // Create new user document if first login
      const timestamp = Date.now();
      await createUser(result.user.uid, {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || undefined,
        photoURL: result.user.photoURL || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
        authProvider: 'google'
      });
    }
  } catch (error) {
    handleAuthError(error);
  }
};
```

### 4. Logout

```typescript
const logout = async () => {
  try {
    await signOut(auth);
    // User state will be updated by the auth state observer
  } catch (error) {
    handleAuthError(error);
  }
};
```

### 5. Error Handling

```typescript
const handleAuthError = (error: unknown) => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('This email is already registered');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError('Invalid email or password');
        break;
      case 'auth/weak-password':
        setError('Password is too weak');
        break;
      case 'auth/popup-closed-by-user':
        // User closed the popup, no need to show error
        break;
      default:
        setError(`Authentication error: ${error.message}`);
    }
  } else {
    setError('An unexpected error occurred');
    console.error(error);
  }
};
```

## Authentication UI Components

### Login Form

Create a login form component that uses the authentication hook:

```tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData.email, formData.password);
    } catch {
      // Error is handled by the auth context
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {(error || authError) && (
        <div className="error">{error || authError}</div>
      )}
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      
      <button type="submit">Log In</button>
    </form>
  );
}
```

### Registration Form

Create a registration form that handles new user signup:

```tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function SignupForm() {
  const { signup, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await signup(formData.name, formData.email, formData.password);
    } catch {
      // Error is handled by the auth context
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields... */}
    </form>
  );
}
```

### Protected Routes

Create a component that protects routes requiring authentication:

```tsx
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }
  
  // Render children if authenticated
  return <>{children}</>;
}
```

## Authentication Validation with Zod

Use Zod schemas to validate authentication inputs:

```typescript
import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
});

// Registration validation schema
export const registerSchema = loginSchema.extend({
  name: z.string()
    .min(1, 'Name is required'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
```

## Advanced Authentication Features

### 1. Password Reset

Implement password reset functionality:

```typescript
const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    handleAuthError(error);
    return false;
  }
};
```

### 2. Email Verification

Send email verification after signup:

```typescript
const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    }
  }
  return false;
};
```

### 3. Account Linking

Link multiple authentication methods to one account:

```typescript
const linkGoogleAccount = async () => {
  if (auth.currentUser) {
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    }
  }
  return false;
};
```

## Security Best Practices

1. **Validate All Inputs**: Always validate user inputs on both client and server sides.

2. **Protect Sensitive Routes**: Use protected routes to prevent unauthorized access.

3. **Handle Auth Errors Gracefully**: Provide user-friendly error messages without revealing sensitive information.

4. **Implement Rate Limiting**: Protect against brute force attacks by limiting login attempts.

5. **Use Strong Password Requirements**: Enforce password complexity requirements.

6. **Keep Firebase SDKs Updated**: Regularly update Firebase dependencies to get security patches.

7. **Store Sensitive Data Securely**: Never store sensitive data in local storage or client-side state.
