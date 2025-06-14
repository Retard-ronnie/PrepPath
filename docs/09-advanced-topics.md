# Advanced Topics and Best Practices

This guide covers advanced topics and best practices for developing and maintaining your PrepPath application.

## Performance Optimization

### Code Splitting

Next.js provides automatic code splitting. Take advantage of this by:

1. Using dynamic imports for large components:

```tsx
import dynamic from 'next/dynamic';

const DynamicInterviewChart = dynamic(
  () => import('../components/interviews/InterviewChart'),
  { loading: () => <p>Loading chart...</p> }
);
```

2. Implementing lazy loading for images:

```tsx
import Image from 'next/image';

function ProfileImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..."
    />
  );
}
```

### Memoization

Use React's memoization features to prevent unnecessary re-renders:

```tsx
import { useMemo, memo } from 'react';

// Memoize expensive calculations
function InterviewStats({ interviews }) {
  const stats = useMemo(() => {
    return calculateStats(interviews); // Expensive operation
  }, [interviews]);
  
  return <div>{/* Render stats */}</div>;
}

// Memoize components that don't need to re-render often
const InterviewCard = memo(function InterviewCard({ interview }) {
  return <div>{/* Render interview card */}</div>;
});
```

### Firebase Query Optimization

Optimize Firestore queries:

1. Create indexes for frequently used queries
2. Limit the amount of data retrieved:

```typescript
// Instead of getting all documents
const querySnapshot = await getDocs(collection(db, "interviews"));

// Limit the query
const querySnapshot = await getDocs(
  query(collection(db, "interviews"), limit(10))
);

// Paginate results
const firstBatch = await getDocs(
  query(collection(db, "interviews"), orderBy("date"), limit(5))
);

const lastVisible = firstBatch.docs[firstBatch.docs.length - 1];

const nextBatch = await getDocs(
  query(
    collection(db, "interviews"),
    orderBy("date"),
    startAfter(lastVisible),
    limit(5)
  )
);
```

## State Management

### Context API Best Practices

1. Split contexts by domain:

```typescript
// AuthContext.tsx
export const AuthContext = createContext<AuthContextType>({...});

// UserContext.tsx
export const UserContext = createContext<UserContextType>({...});

// InterviewContext.tsx
export const InterviewContext = createContext<InterviewContextType>({...});
```

2. Optimize context to prevent unnecessary re-renders:

```typescript
function AuthProvider({ children }) {
  // Split state to minimize re-renders
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Memoize context value
  const value = useMemo(() => ({ user, loading }), [user, loading]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Local State Management

For complex forms, consider using form libraries:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { interviewSchema } from "../schemas/interviewSchema";

function InterviewForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(interviewSchema)
  });
  
  const onSubmit = (data) => {
    // Handle validated form data
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Error Handling

### Global Error Handling

Implement a global error boundary:

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

### API Error Handling

Create a consistent error handling strategy:

```typescript
// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Error handler function
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message, "unknown_error", 500);
  }
  
  return new ApiError("An unknown error occurred", "unknown_error", 500);
}

// Usage
try {
  // API call
} catch (error) {
  const apiError = handleApiError(error);
  
  // Handle based on error code
  switch (apiError.code) {
    case "not_found":
      // Handle not found
      break;
    case "unauthorized":
      // Handle unauthorized
      break;
    default:
      // Handle other errors
  }
}
```

## Security

### Firebase Security Rules

Implement proper security rules in your Firestore database:

```
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Common functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User collection rules
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Interview collection rules
    match /interviews/{interviewId} {
      allow read: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
      allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }
  }
}
```

### XSS Prevention

Prevent XSS attacks:

1. Always sanitize user-generated content before rendering
2. Use Next.js's built-in XSS protections
3. Implement Content Security Policy (CSP)

```tsx
// Sanitize user input
import DOMPurify from 'dompurify';

function SafeHTML({ html }) {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}
```

### CSRF Protection

Next.js provides built-in CSRF protection for API routes.

## Testing

### Unit Testing

Set up Jest for unit testing:

```typescript
// Example test for a utility function
import { formatDate } from '../utils';

describe('formatDate', () => {
  it('formats a date correctly', () => {
    const timestamp = 1622505600000; // June 1, 2021
    expect(formatDate(timestamp)).toBe('June 1, 2021');
  });
  
  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

### Component Testing

Test React components with React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../components/auth/LoginForm';

describe('LoginForm', () => {
  it('renders the form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
  
  it('handles form submission', async () => {
    const mockLogin = jest.fn();
    render(<LoginForm login={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

### E2E Testing

Set up Cypress for end-to-end testing:

```typescript
// cypress/integration/auth.spec.js
describe('Authentication', () => {
  it('allows a user to log in', () => {
    cy.visit('/auth/login');
    
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Password123!');
    
    cy.get('button[type="submit"]').click();
    
    // Verify user is redirected to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
});
```

## Deployment

### Vercel Deployment

Deploy your Next.js application to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Set up custom domains if needed
4. Enable preview deployments for pull requests

### Firebase Hosting

Alternatively, deploy to Firebase Hosting:

1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize your project: `firebase init hosting`
4. Build your Next.js app: `npm run build`
5. Deploy to Firebase: `firebase deploy --only hosting`

## Monitoring and Analytics

### Error Monitoring

Implement error tracking with a service like Sentry:

```typescript
// pages/_app.tsx
import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

### Analytics

Add Google Analytics or Firebase Analytics:

```typescript
// lib/analytics.ts
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from "../service/Firebase";

let analytics;

export function initAnalytics() {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
}

export function trackEvent(eventName, eventParams = {}) {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
}

// Usage
import { trackEvent } from "../lib/analytics";

// Track a user action
trackEvent('interview_created', { 
  interviewType: 'technical',
  company: 'TechCorp'
});
```

## Advanced Firebase Features

### Firebase Cloud Functions

Implement serverless functions for backend tasks:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const updateUserStats = functions.firestore
  .document('interviews/{interviewId}')
  .onWrite(async (change, context) => {
    const newData = change.after.data();
    if (!newData) return; // Document was deleted
    
    const userId = newData.userId;
    
    // Get all user's interviews
    const interviews = await admin.firestore()
      .collection('interviews')
      .where('userId', '==', userId)
      .get();
    
    // Calculate statistics
    const totalInterviews = interviews.size;
    const completedInterviews = interviews.docs
      .filter(doc => doc.data().status === 'completed').length;
    
    // Update user statistics
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        'stats.totalInterviews': totalInterviews,
        'stats.completedInterviews': completedInterviews,
        'updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });
  });
```

### Firebase Storage

Handle file uploads with Firebase Storage:

```typescript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../service/Firebase";

export async function uploadProfileImage(userId, file) {
  // Create a reference
  const storageRef = ref(storage, `users/${userId}/profile.jpg`);
  
  // Upload the file
  await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}
```

## Scaling Your Application

### Feature Flags

Implement feature flags for gradual rollouts:

```typescript
// lib/featureFlags.ts
const featureFlags = {
  enableNewDashboard: process.env.NEXT_PUBLIC_ENABLE_NEW_DASHBOARD === 'true',
  enableInterviewAnalytics: process.env.NEXT_PUBLIC_ENABLE_INTERVIEW_ANALYTICS === 'true',
};

export function isFeatureEnabled(featureName) {
  return featureFlags[featureName] || false;
}

// Usage
import { isFeatureEnabled } from "../lib/featureFlags";

function Dashboard() {
  return (
    <div>
      {isFeatureEnabled('enableNewDashboard') ? (
        <NewDashboard />
      ) : (
        <LegacyDashboard />
      )}
    </div>
  );
}
```

### Internationalization (i18n)

Add multi-language support:

```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to PrepPath',
      login: 'Log In',
      // More translations
    }
  },
  es: {
    translation: {
      welcome: 'Bienvenido a PrepPath',
      login: 'Iniciar Sesión',
      // More translations
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// Usage
import { useTranslation } from 'react-i18next';

function WelcomeMessage() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

### PWA Support

Add Progressive Web App capabilities:

1. Create a `next.config.js` with PWA support:

```javascript
const withPWA = require('next-pwa');

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  }
});
```

2. Add a manifest file in `public/manifest.json`:

```json
{
  "name": "PrepPath",
  "short_name": "PrepPath",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait"
}
```

## Continuous Integration/Continuous Deployment (CI/CD)

Set up a CI/CD pipeline using GitHub Actions:

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
  
  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Conclusion

This advanced guide should help you implement professional-level features and practices in your PrepPath application. As your application grows, these best practices will ensure that it remains maintainable, performant, and secure.
