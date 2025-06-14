# Component Architecture

This guide explains the component architecture in PrepPath, helping you understand how components are organized and how to create new ones.

## Component Structure

The components in PrepPath are organized into three main categories:

1. **UI Components**: Basic UI elements from the Shadcn UI library
2. **Common Components**: Reusable components used across multiple pages
3. **Feature Components**: Components specific to certain features or pages

The component directory structure looks like this:

```
src/
└── components/
    ├── auth/              # Authentication components
    │   └── ProtectedRoute.tsx
    ├── common/            # Common components
    │   └── Navbar.tsx
    └── ui/                # UI components from Shadcn
        ├── button.tsx
        ├── card.tsx
        ├── input.tsx
        └── ...
```

## UI Components

PrepPath uses Shadcn UI, a collection of reusable components built on Radix UI and Tailwind CSS.

### Using Shadcn UI Components

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter your name" />
      </CardContent>
      <CardFooter>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  );
}
```

### Available UI Components

- `accordion.tsx`: Expandable accordion
- `alert.tsx`: Alert messages
- `avatar.tsx`: User avatars
- `badge.tsx`: Status badges
- `button.tsx`: Buttons
- `calendar.tsx`: Date picker
- `card.tsx`: Content containers
- `checkbox.tsx`: Checkboxes
- `dropdown-menu.tsx`: Dropdown menus
- `form.tsx`: Form components
- `input.tsx`: Text inputs
- `label.tsx`: Form labels
- `navigation-menu.tsx`: Navigation components
- `popover.tsx`: Popover elements
- `radio-group.tsx`: Radio buttons
- `select.tsx`: Dropdown select
- `separator.tsx`: Visual separators
- `sheet.tsx`: Slide-out panels
- `switch.tsx`: Toggle switches
- `tabs.tsx`: Tabbed interfaces
- `textarea.tsx`: Multi-line text inputs

## Common Components

Common components are reusable components that are used across multiple pages.

### Navbar Component

The Navbar is a key component that appears on all pages after login:

```tsx
// src/components/common/Navbar.tsx
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Navbar() {
  const { userData, logout } = useAuth();
  
  const userInitials = userData?.name
    ? userData.name.split(' ').map(n => n[0]).join('')
    : 'U';
  
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-xl">
            PrepPath
          </Link>
          
          <nav className="hidden md:flex gap-4">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/interview">Interviews</Link>
            <Link href="/profile">Profile</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={logout}>Logout</Button>
          
          <Link href="/profile">
            <Avatar>
              <AvatarImage src={userData?.photo} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
```

### Protected Route Component

The ProtectedRoute component ensures that only authenticated users can access certain pages:

```tsx
// src/components/auth/ProtectedRoute.tsx
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return null; // Will redirect due to the useEffect
  }
  
  return <>{children}</>;
}
```

## Creating New Components

### Component Structure

When creating new components, follow this structure:

```tsx
// Import dependencies
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Define props interface (if needed)
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

// Create the component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // Component state
  const [isActive, setIsActive] = useState(false);
  
  // Event handlers
  const handleClick = () => {
    setIsActive(!isActive);
    if (onAction) {
      onAction();
    }
  };
  
  // Render component
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <Button 
        variant={isActive ? "default" : "outline"}
        onClick={handleClick}
      >
        {isActive ? "Active" : "Inactive"}
      </Button>
    </div>
  );
}
```

### Component Composition

Use component composition to build complex UIs:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Create smaller sub-components
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// Compose them into a larger component
export function StatsDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Interviews" value={42} />
      <StatCard title="Completed" value={28} />
      <StatCard title="Success Rate" value="67%" />
      <StatCard title="Average Score" value={8.5} />
    </div>
  );
}
```

## Feature-Specific Components

For larger features, create dedicated component files:

### Interview Components

```tsx
// src/components/interviews/InterviewCard.tsx
import { InterviewType } from "@/types/user";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface InterviewCardProps {
  interview: InterviewType;
  onEdit: (id: string) => void;
}

export function InterviewCard({ interview, onEdit }: InterviewCardProps) {
  const statusColor = {
    scheduled: "blue",
    completed: "green",
    cancelled: "gray"
  }[interview.status];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{interview.title}</CardTitle>
          <Badge variant={statusColor}>{interview.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Company:</strong> {interview.company}</p>
          <p><strong>Position:</strong> {interview.position}</p>
          <p><strong>Date:</strong> {formatDate(interview.date)}</p>
          {interview.description && <p>{interview.description}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onEdit(interview.id)}>Edit Interview</Button>
      </CardFooter>
    </Card>
  );
}
```

### Profile Components

```tsx
// src/components/profile/ProfileForm.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/actions/FirebaseUserApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export function ProfileForm() {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    bio: userData?.bio || "",
    location: userData?.location || "",
    website: userData?.website || ""
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    
    setLoading(true);
    try {
      await updateUser(userData.uid, formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
        />
      </div>
      
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
        />
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
```

## Layout Components

Layout components help structure your pages:

```tsx
// src/app/(home)/layout.tsx
import { Navbar } from "@/components/common/Navbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          {children}
        </main>
        <footer className="border-t py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PrepPath. All rights reserved.
        </footer>
      </div>
    </ProtectedRoute>
  );
}
```

## Best Practices for Components

1. **Separation of Concerns**: Each component should have a single responsibility.

2. **Props Interface**: Define explicit prop interfaces for type safety.

3. **Default Props**: Provide sensible defaults for optional props.

4. **Error Handling**: Handle potential errors within components.

5. **Loading States**: Always include loading states for async operations.

6. **Accessibility**: Ensure components are accessible (proper labels, ARIA attributes, keyboard navigation).

7. **Responsive Design**: Use Tailwind's responsive classes to make components work on all screen sizes.

8. **Reusability**: Design components to be reusable when possible.

9. **Performance**: Optimize components for performance (memoization, avoiding unnecessary re-renders).

10. **Testing**: Write tests for critical components.

## Component Documentation

For complex components, add documentation:

```tsx
/**
 * InterviewForm Component
 * 
 * A form for creating or editing interviews.
 * 
 * @param interviewId - Optional ID of an existing interview to edit
 * @param onSuccess - Callback function called after successful submission
 */
export function InterviewForm({
  interviewId,
  onSuccess
}: {
  interviewId?: string;
  onSuccess?: () => void;
}) {
  // Component implementation...
}
```

## Extending the Component System

When adding new features to PrepPath:

1. Identify if existing components can be reused
2. Create new components following the established patterns
3. Place components in the appropriate directory based on their purpose
4. Ensure new components are consistent with the existing design system
