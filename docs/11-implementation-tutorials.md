# Step-by-Step Implementation Tutorials

This document provides detailed, step-by-step tutorials for implementing key features in PrepPath, starting from beginner-level and progressing to advanced implementations.

## Tutorial 1: Creating a New Interview

This tutorial will guide you through implementing the interview creation feature.

### Prerequisites
- Firebase setup completed
- Authentication system working
- User types defined

### Step 1: Create the Interview Form Component

First, let's create a form component for adding new interviews:

```tsx
// src/components/interviews/InterviewForm.tsx
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createInterview } from "@/actions/FirebaseUserApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InterviewForm() {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    company: "",
    position: "",
    status: "scheduled"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.uid) {
      setError("You must be logged in to create an interview");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      // Combine date and time to create timestamp
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const interviewData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.getTime(),
        duration: parseInt(formData.duration, 10),
        status: formData.status as 'scheduled' | 'completed' | 'cancelled',
        company: formData.company,
        position: formData.position
      };
      
      await createInterview(userData.uid, interviewData);
      setSuccess(true);
      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "60",
        company: "",
        position: "",
        status: "scheduled"
      });
    } catch (error) {
      setError("Failed to create interview");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Interview</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>Interview created successfully!</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Interview Title*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Frontend Developer Interview at Google"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about the interview..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date*</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time*</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={handleChange}
                placeholder="60"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Job title/position"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating..." : "Create Interview"}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Step 2: Create the Interview Creation Page

Next, create a page to host the interview form:

```tsx
// src/app/(home)/interview/create/page.tsx
"use client";

import { InterviewForm } from "@/components/interviews/InterviewForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateInterviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Interview</h1>
        <Button variant="outline" asChild>
          <Link href="/interview">Back to Interviews</Link>
        </Button>
      </div>
      
      <InterviewForm />
    </div>
  );
}
```

### Step 3: Update the FirebaseUserApi with the Interview Creation Function

If you haven't already, implement the `createInterview` function in the Firebase API:

```typescript
// src/actions/FirebaseUserApi.ts
// (Add this function if it doesn't exist)

/**
 * Create a new interview for a user
 */
export const createInterview = async (
  uid: string, 
  interviewData: Omit<InterviewType, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Validate interview data (optional, can use Zod)
    const timestamp = Date.now();
    
    // Create the interview document
    const interviewRef = await addDoc(collection(db, "interviews"), {
      ...interviewData,
      userId: uid,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    // Update user's interview references
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserType;
      const interviewIds = userData.interviewIds || [];
      const stats = userData.stats || {
        totalInterviews: 0,
        completedInterviews: 0,
        upcomingInterviews: 0
      };
      
      // Update stats
      stats.totalInterviews += 1;
      if (interviewData.status === 'scheduled') {
        stats.upcomingInterviews += 1;
      } else if (interviewData.status === 'completed') {
        stats.completedInterviews += 1;
      }
      
      // Update user document
      await updateDoc(userRef, {
        interviewIds: [...interviewIds, interviewRef.id],
        [`interviews.${interviewRef.id}`]: {
          id: interviewRef.id,
          ...interviewData,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        stats,
        updatedAt: timestamp
      });
    }
    
    return interviewRef.id;
  } catch (error) {
    console.error("Failed to create interview:", error);
    throw new Error("Failed to create interview");
  }
};
```

### Step 4: Add a Link to the Interview Creation Page

Update your interviews list page to include a link to create a new interview:

```tsx
// src/app/(home)/interview/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react"; // Assuming you're using lucide-react for icons

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Interviews</h1>
        <Button asChild>
          <Link href="/interview/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>
      
      {/* Interview list component will go here */}
    </div>
  );
}
```

### Step 5: Test the Implementation

1. Navigate to the interviews page
2. Click the "New Interview" button
3. Fill out the form with test data
4. Submit the form
5. Verify the interview is created in Firestore
6. Check that the interview appears in the user's interview list

### Troubleshooting Common Issues

1. **Form submission doesn't work**:
   - Check that the user is authenticated
   - Verify that the createInterview function is being called
   - Check the browser console for errors

2. **Data doesn't appear in Firestore**:
   - Verify Firebase permissions
   - Check that the user ID is correctly passed to the function
   - Ensure the data format matches the expected structure

3. **Date/time conversion issues**:
   - Ensure the date and time inputs are properly combined
   - Verify timezone handling

## Tutorial 2: Implementing User Profile Editing

This tutorial will guide you through implementing the profile editing feature.

### Step 1: Create a Profile Form Component

```tsx
// src/components/profile/ProfileForm.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/actions/FirebaseUserApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserUpdateType } from "@/schemas/userSchema";

export function ProfileForm() {
  const { userData } = useAuth();
  const [formData, setFormData] = useState<UserUpdateType>({
    name: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    title: "",
    company: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load user data when available
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        bio: userData.bio || "",
        location: userData.location || "",
        website: userData.website || "",
        phone: userData.phone || "",
        title: userData.title || "",
        company: userData.company || ""
      });
    }
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.uid) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      await updateUser(userData.uid, formData);
      setSuccess(true);
    } catch (error) {
      setError("Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Professional Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Your current company"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Step 2: Create the Edit Profile Page

```tsx
// src/app/(home)/edit-profile/page.tsx
"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Button variant="outline" asChild>
          <Link href="/profile">Back to Profile</Link>
        </Button>
      </div>
      
      <ProfileForm />
    </div>
  );
}
```

### Step 3: Update the Profile Page with an Edit Button

```tsx
// src/app/(home)/profile/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react"; // Assuming you're using lucide-react for icons

export default function ProfilePage() {
  const { userData } = useAuth();
  
  if (!userData) {
    return <div>Loading profile...</div>;
  }
  
  const userInitials = userData.name
    ? userData.name.split(' ').map(n => n[0]).join('')
    : 'U';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button asChild>
          <Link href="/edit-profile">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userData.photo || userData.photoURL} />
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{userData.name || userData.displayName}</CardTitle>
            {userData.title && <p className="text-muted-foreground">{userData.title}</p>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {userData.bio && (
            <div>
              <h3 className="font-medium">About</h3>
              <p>{userData.bio}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.company && (
              <div>
                <h3 className="font-medium">Company</h3>
                <p>{userData.company}</p>
              </div>
            )}
            
            {userData.location && (
              <div>
                <h3 className="font-medium">Location</h3>
                <p>{userData.location}</p>
              </div>
            )}
            
            {userData.website && (
              <div>
                <h3 className="font-medium">Website</h3>
                <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {userData.website}
                </a>
              </div>
            )}
            
            {userData.phone && (
              <div>
                <h3 className="font-medium">Phone</h3>
                <p>{userData.phone}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{userData.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 4: Test the Implementation

1. Navigate to the profile page
2. Click the "Edit Profile" button
3. Update profile information
4. Save changes
5. Verify the updates appear on the profile page
6. Check that the data is updated in Firestore

## Tutorial 3: Implementing a Dashboard with Statistics

This tutorial will guide you through creating a dashboard with user statistics.

### Step 1: Create Utility Functions for Statistics

```typescript
// src/lib/statsUtils.ts
import type { InterviewType, UserStatsType } from "@/types/user";

/**
 * Calculate user statistics from interview data
 */
export function calculateUserStats(interviews: InterviewType[]): UserStatsType {
  const totalInterviews = interviews.length;
  
  const completedInterviews = interviews.filter(
    i => i.status === 'completed'
  ).length;
  
  const upcomingInterviews = interviews.filter(
    i => i.status === 'scheduled' && i.date > Date.now()
  ).length;
  
  // Calculate pass rate
  const interviewsWithResult = interviews.filter(
    i => i.status === 'completed' && ['passed', 'failed'].includes(i.result || '')
  );
  
  const passedInterviews = interviewsWithResult.filter(
    i => i.result === 'passed'
  ).length;
  
  const passRate = interviewsWithResult.length > 0
    ? (passedInterviews / interviewsWithResult.length) * 100
    : undefined;
  
  // Calculate average score
  const interviewsWithScore = interviews.filter(i => typeof i.score === 'number');
  
  const averageScore = interviewsWithScore.length > 0
    ? interviewsWithScore.reduce((sum, i) => sum + (i.score || 0), 0) / interviewsWithScore.length
    : undefined;
  
  // Find most recent interview
  const sortedInterviews = [...interviews].sort((a, b) => b.date - a.date);
  const mostRecentInterview = sortedInterviews.length > 0 
    ? sortedInterviews[0].id 
    : undefined;
  
  return {
    totalInterviews,
    completedInterviews,
    upcomingInterviews,
    passRate,
    averageScore,
    mostRecentInterview,
    lastActive: Date.now()
  };
}

/**
 * Format a percentage value
 */
export function formatPercentage(value?: number): string {
  if (value === undefined) return 'N/A';
  return `${value.toFixed(1)}%`;
}

/**
 * Format a score value
 */
export function formatScore(value?: number): string {
  if (value === undefined) return 'N/A';
  return value.toFixed(1);
}

/**
 * Get upcoming interviews sorted by date
 */
export function getUpcomingInterviews(interviews: InterviewType[]): InterviewType[] {
  return interviews
    .filter(i => i.status === 'scheduled' && i.date > Date.now())
    .sort((a, b) => a.date - b.date);
}

/**
 * Format a date as a readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a time as a readable string
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

### Step 2: Create Dashboard Components

First, create stat card components:

```tsx
// src/components/dashboard/StatCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

Next, create an upcoming interviews component:

```tsx
// src/components/dashboard/UpcomingInterviews.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { InterviewType } from "@/types/user";
import { formatDate, formatTime } from "@/lib/statsUtils";

interface UpcomingInterviewsProps {
  interviews: InterviewType[];
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Interviews</CardTitle>
        <Button variant="outline" asChild>
          <Link href="/interview">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {interviews.length === 0 ? (
          <p className="text-muted-foreground">No upcoming interviews scheduled.</p>
        ) : (
          <div className="space-y-4">
            {interviews.map(interview => (
              <div key={interview.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">{interview.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {interview.company && `${interview.company} • `}
                    {formatDate(interview.date)} at {formatTime(interview.date)}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/interview/edit/${interview.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create the Dashboard Page

```tsx
// src/app/(home)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserInterviews, updateUserStats } from "@/actions/FirebaseUserApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingInterviews } from "@/components/dashboard/UpcomingInterviews";
import { 
  calculateUserStats, 
  formatPercentage, 
  formatScore,
  getUpcomingInterviews
} from "@/lib/statsUtils";
import type { InterviewType } from "@/types/user";
import { Calendar, CheckCircle, Clock, PlusCircle, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { userData } = useAuth();
  const [interviews, setInterviews] = useState<InterviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) return;
      
      try {
        // Fetch user's interviews
        const userInterviews = await getUserInterviews(userData.uid);
        setInterviews(userInterviews);
        
        // Calculate and update stats if needed
        if (!userData.stats || userData.stats.totalInterviews !== userInterviews.length) {
          const newStats = calculateUserStats(userInterviews);
          await updateUserStats(userData.uid, newStats);
        }
      } catch (error) {
        setError("Failed to load dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData?.uid, userData?.stats]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Get stats from user data or calculate them
  const stats = userData?.stats || calculateUserStats(interviews);
  
  // Get upcoming interviews
  const upcomingInterviewsList = getUpcomingInterviews(interviews).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/interview/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Interviews"
          value={stats.totalInterviews}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Completed"
          value={stats.completedInterviews}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Success Rate"
          value={formatPercentage(stats.passRate)}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingInterviews}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <UpcomingInterviews interviews={upcomingInterviewsList} />
      </div>
    </div>
  );
}
```

### Step 4: Test the Implementation

1. Create a few test interviews with different statuses
2. Navigate to the dashboard page
3. Verify that the statistics are displayed correctly
4. Check that upcoming interviews are listed
5. Test navigation to interview details

## Tutorial 4: Implementing a Complete Interview List

This tutorial guides you through creating a complete interview list with filtering and sorting capabilities.

### Step 1: Create Interview List Components

First, create an interview card component:

```tsx
// src/components/interviews/InterviewCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/statsUtils";
import type { InterviewType } from "@/types/user";
import Link from "next/link";
import { Calendar, Building, Briefcase } from "lucide-react";

interface InterviewCardProps {
  interview: InterviewType;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  // Determine badge color based on status
  const statusColor = {
    scheduled: "blue",
    completed: "green",
    cancelled: "gray"
  }[interview.status] || "gray";
  
  // Determine result badge if completed
  const resultBadge = interview.status === 'completed' && interview.result && {
    passed: <Badge className="bg-green-500">Passed</Badge>,
    failed: <Badge className="bg-red-500">Failed</Badge>,
    pending: <Badge className="bg-yellow-500">Pending</Badge>,
    unknown: <Badge className="bg-gray-500">Unknown</Badge>
  }[interview.result];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{interview.title}</CardTitle>
          <Badge variant={statusColor as "default" | "secondary" | "destructive" | "outline"}>
            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          {interview.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{interview.company}</span>
            </div>
          )}
          
          {interview.position && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{interview.position}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(interview.date)} at {formatTime(interview.date)}</span>
          </div>
          
          {resultBadge && (
            <div className="flex items-center gap-2">
              <span>Result:</span>
              {resultBadge}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/interview/edit/${interview.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

Next, create filter and sort components:

```tsx
// src/components/interviews/InterviewFilters.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface InterviewFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
}

export function InterviewFilters({
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder
}: InterviewFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/2 space-y-2">
        <Label htmlFor="status-filter">Filter by Status</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-1/2 space-y-2">
        <Label htmlFor="sort-order">Sort by</Label>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger id="sort-order">
            <SelectValue placeholder="Date (Newest First)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (Newest First)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="company-asc">Company (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

### Step 2: Create the Interview List Page

```tsx
// src/app/(home)/interview/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserInterviews } from "@/actions/FirebaseUserApi";
import { Button } from "@/components/ui/button";
import { InterviewCard } from "@/components/interviews/InterviewCard";
import { InterviewFilters } from "@/components/interviews/InterviewFilters";
import type { InterviewType } from "@/types/user";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function InterviewsPage() {
  const { userData } = useAuth();
  const [interviews, setInterviews] = useState<InterviewType[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<InterviewType[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!userData?.uid) return;
      
      try {
        const userInterviews = await getUserInterviews(userData.uid);
        setInterviews(userInterviews);
      } catch (error) {
        setError("Failed to load interviews");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, [userData?.uid]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...interviews];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "date-desc":
        filtered.sort((a, b) => b.date - a.date);
        break;
      case "date-asc":
        filtered.sort((a, b) => a.date - b.date);
        break;
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "company-asc":
        filtered.sort((a, b) => {
          const companyA = a.company || "";
          const companyB = b.company || "";
          return companyA.localeCompare(companyB);
        });
        break;
      default:
        filtered.sort((a, b) => b.date - a.date);
    }
    
    setFilteredInterviews(filtered);
  }, [interviews, statusFilter, sortOrder]);

  if (loading) {
    return <div>Loading interviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Interviews</h1>
        <Button asChild>
          <Link href="/interview/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>
      
      <InterviewFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      {error && <div className="text-red-500">{error}</div>}
      
      {filteredInterviews.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No interviews found</h3>
          <p className="text-muted-foreground">
            {interviews.length === 0
              ? "You haven't created any interviews yet."
              : "No interviews match your current filters."}
          </p>
          {interviews.length === 0 && (
            <Button className="mt-4" asChild>
              <Link href="/interview/create">Create Your First Interview</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInterviews.map(interview => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Test the Implementation

1. Create several interviews with different statuses, dates, and companies
2. Navigate to the interviews page
3. Test the filtering functionality
4. Test the sorting functionality
5. Verify that the interviews display correctly
6. Test navigation to interview details

## Conclusion

These tutorials provide step-by-step guides for implementing key features in PrepPath. By following these tutorials, you should be able to understand the application structure and implement new features on your own.

Some next steps you might consider:

1. Implement the interview edit feature
2. Add social profile management
3. Create a notification system
4. Implement user preferences
5. Add advanced analytics and visualizations

Remember to follow the established patterns and best practices as you extend the application with new features.
