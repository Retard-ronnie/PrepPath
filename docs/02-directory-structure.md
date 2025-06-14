# Directory Structure

This document explains the organization of the PrepPath project, helping you understand where different components are located and how they relate to each other.

## Root Structure

```
preppath/
├── components.json     # Shadcn UI configuration
├── eslint.config.mjs   # ESLint configuration
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── docs/               # Documentation (you are here)
├── public/             # Static assets
└── src/                # Source code
```

## Source Directory (`src/`)

The `src/` directory contains all the application code, organized into logical modules:

```
src/
├── actions/            # Firebase API functions
├── app/                # Next.js App Router pages
├── components/         # Reusable React components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── schemas/            # Zod validation schemas
├── service/            # Service configurations (Firebase)
└── types/              # TypeScript type definitions
```

### Key Directories Explained

#### `actions/`

Contains Firebase API functions for interacting with Firestore. The main file is `FirebaseUserApi.ts`, which provides functions for user and interview management.

#### `app/`

Contains Next.js pages organized by route, following the App Router convention:

```
app/
├── globals.css         # Global styles
├── layout.tsx          # Root layout component
├── (home)/             # Protected routes
│   ├── dashboard/      # User dashboard
│   ├── edit-profile/   # Profile editing
│   ├── interview/      # Interview management
│   └── profile/        # User profile view
└── auth/               # Authentication pages
    ├── login/          # Login page
    ├── signup/         # Registration page
    └── forgot-password/# Password recovery
```

#### `components/`

Contains reusable React components, organized by type:

```
components/
├── auth/               # Authentication-related components
├── common/             # Common components (e.g., Navbar)
└── ui/                 # UI components from Shadcn
```

#### `context/`

Contains React Context providers for state management:

- `AuthProvider.tsx`: Manages authentication state
- `Contexts.ts`: Exports context objects

#### `hooks/`

Contains custom React hooks:

- `useAuth.ts`: Hook for accessing authentication context

#### `schemas/`

Contains Zod validation schemas:

- `userSchema.ts`: Validation schemas for user data

#### `service/`

Contains service configurations:

- `Firebase.ts`: Firebase initialization and exports

#### `types/`

Contains TypeScript type definitions:

- `user.d.ts`: User and related type definitions

## Understanding the Structure

The project follows a modular architecture where:

1. **Data Flow**:
   - Types define the data structure
   - Schemas validate the data
   - Actions perform operations on the data
   - Context provides data to components
   - Components render the data

2. **Component Organization**:
   - Common components are reused across multiple pages
   - UI components provide the base design system
   - Page components represent full pages

3. **Route Organization**:
   - Auth routes handle user authentication
   - Protected home routes require authentication
   - Layout components wrap pages for consistent design

This structure promotes separation of concerns and makes it easier to locate and modify specific parts of the application.
