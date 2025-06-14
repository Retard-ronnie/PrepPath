# Firebase Integration Guide

This guide explains how Firebase is integrated into PrepPath and how to work with Firebase services in your application.

## Firebase Setup

PrepPath uses Firebase for:
1. User Authentication
2. Data Storage (Firestore)

### Firebase Configuration

The Firebase configuration is in `src/service/Firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

### Environment Variables

Firebase configuration requires environment variables to be set in your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Authentication

### Auth Methods

PrepPath supports two authentication methods:

1. **Email/Password Authentication**: Traditional signup and login
2. **Google OAuth Authentication**: "Sign in with Google" functionality

### Auth Implementation

#### 1. Authentication Context

The `AuthProvider` in `src/context/AuthProvider.tsx` manages authentication state:

```typescript
export interface AuthContextType {
  user: User | null;      // Firebase user object
  userData: UserType | null; // User data from Firestore
  loading: boolean;
}
```

#### 2. Using Authentication

The `useAuth` hook provides access to authentication state:

```typescript
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, userData, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {userData?.name}!</div>;
}
```

#### 3. Authentication Functions

The Firebase API provides authentication functions:

```typescript
import { loginWithGoogle, SignoutUser } from "../actions/FirebaseUserApi";

// Google login
const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle();
  } catch (error) {
    console.error("Google login failed:", error);
  }
};

// Sign out
const handleSignout = async () => {
  try {
    await SignoutUser();
  } catch (error) {
    console.error("Sign out failed:", error);
  }
};
```

## Firestore Database

### Data Structure

PrepPath uses the following Firestore collections:

1. **users**: User profile data
2. **interviews**: Interview records

### Database Access

The `FirebaseUserApi.ts` file provides functions for database operations:

#### User Operations

```typescript
// Create a user
createUser(uid, userData);

// Get user data
const userData = await getUser(uid);

// Update user data
updateUser(uid, updates);

// Delete user
deleteUser(uid);
```

#### Interview Operations

```typescript
// Create an interview
const interviewId = await createInterview(uid, interviewData);

// Get user's interviews
const interviews = await getUserInterviews(uid);

// Update an interview
updateInterview(interviewId, updates);

// Delete an interview
deleteInterview(interviewId);
```

#### User Preferences

```typescript
// Update user preferences
updateUserPreferences(uid, preferences);

// Update user stats
updateUserStats(uid, stats);
```

### Working with Firestore

#### 1. Creating Documents

```typescript
import { doc, setDoc } from "firebase/firestore";
import { db } from "../service/Firebase";

// Create a new document with a known ID
await setDoc(doc(db, "collection", "documentId"), data);

// Create a document with auto-generated ID
import { collection, addDoc } from "firebase/firestore";
const docRef = await addDoc(collection(db, "collection"), data);
const newId = docRef.id;
```

#### 2. Reading Documents

```typescript
import { doc, getDoc } from "firebase/firestore";

// Get a single document
const docSnap = await getDoc(doc(db, "collection", "documentId"));
if (docSnap.exists()) {
  const data = docSnap.data();
  // Use data...
}

// Query multiple documents
import { collection, query, where, getDocs } from "firebase/firestore";
const q = query(
  collection(db, "collection"),
  where("field", "==", value)
);
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  // doc.data() is the document data
  // doc.id is the document ID
});
```

#### 3. Updating Documents

```typescript
import { doc, updateDoc } from "firebase/firestore";

await updateDoc(doc(db, "collection", "documentId"), {
  field1: newValue1,
  field2: newValue2,
});
```

#### 4. Deleting Documents

```typescript
import { doc, deleteDoc } from "firebase/firestore";

await deleteDoc(doc(db, "collection", "documentId"));
```

## Best Practices for Firebase

### 1. Security Rules

Always set up proper security rules in your Firebase console to protect your data. Basic rules to enforce:

- Only authenticated users can read/write their own data
- Users can only read/write their own interview documents

### 2. Data Validation

Always validate data before saving to Firestore:

```typescript
// Using Zod for validation
const result = userUpdateSchema.safeParse(updates);
if (!result.success) {
  throw new Error("Invalid User Data");
}
// Now safe to save to Firestore
await updateDoc(doc(db, "users", uid), result.data);
```

### 3. Error Handling

Always wrap Firebase operations in try/catch blocks:

```typescript
try {
  await updateDoc(doc(db, "users", uid), updates);
} catch (error) {
  console.error("Failed to update user:", error);
  // Handle error appropriately
}
```

### 4. Batched Writes

For operations that update multiple documents, use batched writes:

```typescript
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);
batch.update(doc(db, "users", uid), { field: value });
batch.update(doc(db, "interviews", interviewId), { field: value });
await batch.commit();
```

### 5. Offline Support

Firebase Firestore has offline capabilities. Configure persistence for a better user experience:

```typescript
import { enableIndexedDbPersistence } from "firebase/firestore";

enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error("Persistence failed:", err);
  });
```

## Firebase Free Tier Limitations

When working with the Firebase free tier, be aware of these limitations:

1. **Firestore**: 
   - 1GB of storage
   - 50,000 reads, 20,000 writes, 20,000 deletes per day
   
2. **Authentication**:
   - 10,000 authentications per month
   
3. **Hosting**:
   - 10GB bandwidth per month
   - 1GB storage

To optimize for the free tier:

1. Minimize unnecessary reads and writes
2. Use composite fields instead of queries when possible
3. Store only essential data
4. Implement client-side caching
5. Consider pagination for large data sets
