# User Data Types Guide

This guide explains the user data types in PrepPath, how they're structured, and how to use them effectively in your application.

## Overview of User Types

The user data type system in PrepPath is designed to handle various user scenarios:

1. Regular email/password signup
2. OAuth providers (like Google)
3. Comprehensive user profiles
4. Interview tracking
5. User preferences and statistics

## Core User Type Structure

The `UserType` interface in `src/types/user.d.ts` is the central type definition that represents a user in the system:

```typescript
export interface UserType {
  // Basic user info (required)
  uid: string;
  email: string;
  
  // Auth provider info
  authProvider?: 'email' | 'google' | 'github' | 'facebook';
  emailVerified?: boolean;
  
  // Name fields
  name?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  
  // Profile information
  photo?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  
  // Professional info
  title?: string;
  company?: string;
  education?: { /* ... */ }[];
  
  // Social profiles
  socialProfiles?: { /* ... */ };
  
  // Interview related data
  interviews?: Record<string, InterviewType>;
  interviewIds?: string[];
  nextInterviewId?: string;
  
  // User preferences and statistics
  preferences?: UserPreferencesType;
  stats?: UserStatsType;
  
  // System fields
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
  
  // Subscription info
  plan?: 'free' | 'premium' | 'enterprise';
  planExpiresAt?: number;
  
  // Firebase specific fields
  metadata?: { /* ... */ };
}
```

## Understanding the Fields

### Basic User Info
- `uid`: Unique identifier from Firebase Auth
- `email`: User's email address

### Auth Provider Info
- `authProvider`: Indicates how the user authenticated (email, Google, etc.)
- `emailVerified`: Whether the email has been verified

### Name Fields
The system supports multiple name formats to accommodate different auth providers:
- `name`: Traditional full name (typically for email signup)
- `displayName`: Display name from OAuth providers
- `firstName` and `lastName`: For more structured name storage

### Profile Information
Standard profile fields including:
- `photo` / `photoURL`: Profile image (both field names supported for compatibility)
- `bio`: User biography
- `location`: User's location
- `website`: Personal website
- `phone`: Contact number

### Professional Info
- `title`: Job title
- `company`: Current company
- `education`: Array of education history entries

### Social Profiles
Links to the user's social media profiles:
- `linkedin`, `github`, `twitter`, `portfolio`

### Interview Related Data
- `interviews`: Map of interview objects indexed by ID
- `interviewIds`: Array of interview IDs for quick access
- `nextInterviewId`: Reference to the next upcoming interview

### User Preferences and Statistics
- `preferences`: User customization settings
- `stats`: Aggregated statistics about the user's activity

### System Fields
- `createdAt`: Timestamp when the user was created
- `updatedAt`: Timestamp when the user was last updated
- `lastLogin`: Timestamp of the last login

### Subscription Info
- `plan`: Current subscription tier
- `planExpiresAt`: Expiration timestamp for the subscription

### Firebase Specific Fields
- `metadata`: Additional data from Firebase Auth

## Related Types

### InterviewType

Represents an interview entry:

```typescript
export interface InterviewType {
  id: string;
  title: string;
  description?: string;
  date: number; // timestamp
  duration?: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  company?: string;
  position?: string;
  questions?: string[];
  feedback?: string;
  result?: 'pending' | 'passed' | 'failed' | 'unknown';
  score?: number;
  createdAt: number;
  updatedAt: number;
}
```

### UserPreferencesType

Stores user preferences:

```typescript
export interface UserPreferencesType {
  jobInterests?: string[];
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredCompanies?: string[];
  notificationSettings?: {
    email: boolean;
    push: boolean;
    reminderHours?: number;
  };
  theme?: 'light' | 'dark' | 'system';
}
```

### UserStatsType

Tracks user statistics:

```typescript
export interface UserStatsType {
  totalInterviews: number;
  completedInterviews: number;
  upcomingInterviews: number;
  passRate?: number;
  averageScore?: number;
  mostRecentInterview?: string;
  streakDays?: number;
  lastActive?: number;
}
```

## How to Use These Types

### Accessing User Data

User data is available through the `AuthContext`:

```typescript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { userData } = useAuth();
  
  if (!userData) {
    return <div>Loading...</div>;
  }
  
  return <div>Welcome, {userData.name || userData.displayName}!</div>;
}
```

### Creating a New User

When creating a new user, you need to provide the required fields:

```typescript
import { createUser } from "../actions/FirebaseUserApi";

const newUserData: Partial<UserType> = {
  uid: "user123",
  email: "user@example.com",
  name: "John Doe",
  // Other fields as needed
};

await createUser(newUserData.uid, newUserData);
```

### Updating User Data

Use the `updateUser` function to update user data:

```typescript
import { updateUser } from "../actions/FirebaseUserApi";
import type { UserUpdateType } from "../schemas/userSchema";

const updates: UserUpdateType = {
  bio: "New bio content",
  location: "New York"
};

await updateUser(userData.uid, updates);
```

## Best Practices

1. **Optional Fields**: Most fields are optional to accommodate different user scenarios. Always check if a field exists before accessing it.

2. **Name Handling**: Always use a fallback when displaying names:
   ```typescript
   const displayName = userData.name || userData.displayName || "User";
   ```

3. **Timestamps**: All timestamps are stored as milliseconds since epoch (from `Date.now()`).

4. **Type Guards**: Use TypeScript type guards when working with potentially undefined values:
   ```typescript
   if (userData?.stats?.totalInterviews > 0) {
     // Safe to use
   }
   ```

5. **Data Validation**: Always validate user input using Zod schemas before sending it to the database.

## Extending the User Type

If you need to add new fields to the user type:

1. Update the `UserType` interface in `src/types/user.d.ts`
2. Add corresponding validation in `src/schemas/userSchema.ts`
3. Update any relevant API functions in `src/actions/FirebaseUserApi.ts`

This ensures type safety and proper validation throughout the application.
