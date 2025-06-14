# Data Validation with Zod

This guide explains how to use Zod for data validation in PrepPath, ensuring that your data is always valid and type-safe.

## Introduction to Zod

Zod is a TypeScript-first schema validation library that allows you to create schemas to validate your data and automatically infer TypeScript types from those schemas.

In PrepPath, Zod is used to:

1. Validate user input before saving to the database
2. Define the shape of data structures
3. Create TypeScript types from schemas
4. Validate API payloads

## Basic Zod Usage

### Setting Up a Schema

```typescript
import { z } from 'zod';

// Define a schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18 years old").optional()
});

// Infer the TypeScript type from the schema
type User = z.infer<typeof userSchema>;

// Example usage
const userData = {
  name: "John Doe",
  email: "john@example.com",
  age: 25
};

// Validate the data
const result = userSchema.safeParse(userData);

if (result.success) {
  // Data is valid
  const validatedData = result.data;
  console.log("Valid data:", validatedData);
} else {
  // Data is invalid
  const errorMessages = result.error.format();
  console.error("Validation errors:", errorMessages);
}
```

## User Schema Implementation

In PrepPath, user schemas are defined in `src/schemas/userSchema.ts`:

### Basic User Update Schema

```typescript
// Basic user update schema for profile updates
export const userUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name must be at least 1 character long" }).optional(),
  displayName: z.string().min(1, { message: "Display name must be at least 1 character long" }).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().min(1, {message: 'Email must be at least 1 character'}).optional(),
  photo: z.string().url().optional(),
  photoURL: z.string().url().optional(),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional()
});

// Infer type from schema
export type UserUpdateType = z.infer<typeof userUpdateSchema>;
```

### Authentication Schemas

```typescript
// Login Schema
export const loginSchema = z.object({
  email: z.string()
    .min(8, 'At least 8 Character required')
    .regex(/[a-z]/, 'Email must contain at least one lowercase letter'),
  password: z.string()
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export type LoginType = z.infer<typeof loginSchema>;

// Register Schema with password confirmation
export const registerSchema = loginSchema.extend({
  name: z.string().min(1, { message: "Name must be at least 1 character long" }).optional(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ["confirmPassword"]
});

export type RegisterType = z.infer<typeof registerSchema>;
```

### Complete User Schema

```typescript
// Complete user schema (for reference, not typically used for validation)
export const completeUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  authProvider: z.enum(['email', 'google', 'github', 'facebook']).optional(),
  emailVerified: z.boolean().optional(),
  name: z.string().optional(),
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  photo: z.string().optional(),
  photoURL: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  education: z.array(educationSchema).optional(),
  socialProfiles: socialProfilesSchema.optional(),
  interviews: z.record(z.string(), interviewSchema).optional(),
  interviewIds: z.array(z.string()).optional(),
  nextInterviewId: z.string().optional(),
  preferences: userPreferencesSchema.optional(),
  stats: z.object({
    totalInterviews: z.number().default(0),
    completedInterviews: z.number().default(0),
    upcomingInterviews: z.number().default(0),
    passRate: z.number().optional(),
    averageScore: z.number().optional(),
    mostRecentInterview: z.string().optional(),
    streakDays: z.number().optional(),
    lastActive: z.number().optional()
  }).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastLogin: z.number().optional(),
  plan: z.enum(['free', 'premium', 'enterprise']).default('free').optional(),
  planExpiresAt: z.number().optional(),
  metadata: z.object({
    creationTime: z.string().optional(),
    lastSignInTime: z.string().optional()
  }).optional()
});

export type CompleteUserType = z.infer<typeof completeUserSchema>;
```

## Using Schemas for Validation

### Validating Form Input

```typescript
import { registerSchema } from "../schemas/userSchema";

// Form submission handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData = {
    name: "John Doe",
    email: "john@example.com",
    password: "Password123!",
    confirmPassword: "Password123!"
  };
  
  // Validate form data
  const result = registerSchema.safeParse(formData);
  
  if (!result.success) {
    // Handle validation errors
    const formattedErrors = result.error.format();
    console.error("Validation errors:", formattedErrors);
    
    // Example: display the first error message
    const firstError = Object.values(formattedErrors)
      .find(field => field && field._errors && field._errors.length > 0);
    
    if (firstError && firstError._errors) {
      setError(firstError._errors[0]);
    } else {
      setError("Invalid form data");
    }
    
    return;
  }
  
  // Data is valid, proceed with submission
  const validatedData = result.data;
  // ...
};
```

### Validating API Data

In the Firebase API functions, use Zod to validate data before saving:

```typescript
import { userUpdateSchema } from "../schemas/userSchema";

export const updateUser = async (uid: string, updates: UserUpdateType) => {
  // Validate the updates
  const result = userUpdateSchema.safeParse(updates);

  if (!result.success) {
    throw new Error("Invalid User Data");
  }

  // Data is valid, proceed with update
  const updatedData = {
    ...result.data,
    updatedAt: Date.now()
  };

  await updateDoc(doc(db, "users", uid), updatedData);
};
```

## Advanced Zod Features

### Custom Validation with `refine`

You can add custom validation rules using `refine`:

```typescript
const passwordChangeSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
});
```

### Transforming Data with `transform`

You can transform data during validation:

```typescript
const userProfileSchema = z.object({
  name: z.string().transform(val => val.trim()),
  email: z.string().email().transform(val => val.toLowerCase()),
  birthDate: z.string().transform(val => new Date(val).getTime()) // Convert to timestamp
});
```

### Union Types

Handle multiple possible formats:

```typescript
const nameSchema = z.union([
  z.object({
    firstName: z.string(),
    lastName: z.string()
  }),
  z.object({
    displayName: z.string()
  })
]);
```

### Default Values

Provide default values for optional fields:

```typescript
const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  emailNotifications: z.boolean().default(true),
  language: z.string().default('en')
});
```

## Zod with React Hook Form

For form validation in React components, you can integrate Zod with React Hook Form:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/userSchema";
import type { LoginType } from "../schemas/userSchema";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = (data: LoginType) => {
    // Data is already validated by Zod
    console.log("Valid form data:", data);
    // Proceed with login...
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" {...register("email")} />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>
      
      <button type="submit">Log In</button>
    </form>
  );
}
```

## Best Practices for Zod

1. **Create Reusable Schemas**: Break down schemas into smaller, reusable components that can be combined.

2. **Infer Types**: Always infer TypeScript types from your schemas to ensure type safety.

3. **Error Messages**: Provide clear, user-friendly error messages for each validation rule.

4. **Validation Strategy**: Decide where validation should occur:
   - Client-side: Immediate feedback for users
   - Server-side: Security and data integrity
   - Both: For the best user experience and security

5. **Performance**: For large schemas, consider validating only the required fields when partial updates are performed.

6. **Testing**: Write tests for your schemas to ensure they validate correctly.

## Schema Organization

Organize your schemas by domain:

```
src/
└── schemas/
    ├── userSchema.ts     # User-related schemas
    ├── interviewSchema.ts # Interview-related schemas
    ├── authSchema.ts     # Authentication schemas
    └── commonSchema.ts   # Shared schema components
```

## Extending Schemas for Future Features

When adding new features to PrepPath, follow these steps:

1. Define the data structure as a Zod schema
2. Infer TypeScript types from the schema
3. Implement validation in UI components and API functions
4. Update existing schemas when necessary, being careful not to break existing functionality

This approach ensures that all data is properly validated and typed throughout the application.
