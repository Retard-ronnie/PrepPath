# Interview Management Guide

This guide explains how to implement and use the interview management features in PrepPath.

## Interview Data Model

The interview system is built around the `InterviewType` interface:

```typescript
export interface InterviewType {
  id: string;                // Unique identifier
  title: string;             // Interview title
  description?: string;      // Optional description
  date: number;              // Timestamp of the interview
  duration?: number;         // Duration in minutes
  status: 'scheduled' | 'completed' | 'cancelled'; // Interview status
  notes?: string;            // Additional notes
  company?: string;          // Company name
  position?: string;         // Job position
  questions?: string[];      // List of questions asked
  feedback?: string;         // Feedback received
  result?: 'pending' | 'passed' | 'failed' | 'unknown'; // Interview result
  score?: number;            // Numerical score (if applicable)
  createdAt: number;         // Creation timestamp
  updatedAt: number;         // Last update timestamp
}
```

## Creating an Interview

### Using the API

```typescript
import { createInterview } from "../actions/FirebaseUserApi";

// Create a new interview
const createNewInterview = async (userId: string) => {
  try {
    const interviewData = {
      title: "Frontend Developer Interview at TechCorp",
      description: "Second round technical interview",
      date: new Date("2025-06-10T14:00:00").getTime(), // Convert to timestamp
      duration: 60, // 60 minutes
      status: "scheduled" as const,
      company: "TechCorp",
      position: "Senior Frontend Developer"
    };
    
    const interviewId = await createInterview(userId, interviewData);
    return interviewId;
  } catch (error) {
    console.error("Failed to create interview:", error);
    throw error;
  }
};
```

### Form Implementation

Create a form component for adding new interviews:

```tsx
import { useState } from "react";
import { createInterview } from "../actions/FirebaseUserApi";
import { useAuth } from "../hooks/useAuth";

export function InterviewForm() {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60",
    company: "",
    position: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const interviewData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.getTime(),
        duration: parseInt(formData.duration, 10),
        status: "scheduled" as const,
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
        position: ""
      });
    } catch (error) {
      setError("Failed to create interview");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Interview created successfully!</div>}
      
      <div>
        <label htmlFor="title">Interview Title*</label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="date">Date*</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="time">Time*</label>
        <input
          id="time"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="duration">Duration (minutes)</label>
        <input
          id="duration"
          name="duration"
          type="number"
          min="15"
          step="15"
          value={formData.duration}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="position">Position</label>
        <input
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Interview"}
      </button>
    </form>
  );
}
```

## Retrieving Interviews

### Getting All User Interviews

```typescript
import { getUserInterviews } from "../actions/FirebaseUserApi";

const fetchUserInterviews = async (userId: string) => {
  try {
    const interviews = await getUserInterviews(userId);
    
    // Sort by date (newest first)
    interviews.sort((a, b) => b.date - a.date);
    
    return interviews;
  } catch (error) {
    console.error("Failed to fetch interviews:", error);
    return [];
  }
};
```

### Displaying Interviews List

Create a component to display a list of interviews:

```tsx
import { useEffect, useState } from "react";
import { getUserInterviews } from "../actions/FirebaseUserApi";
import { useAuth } from "../hooks/useAuth";
import type { InterviewType } from "../types/user";

export function InterviewsList() {
  const { userData } = useAuth();
  const [interviews, setInterviews] = useState<InterviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div>Loading interviews...</div>;
  if (error) return <div className="error">{error}</div>;
  if (interviews.length === 0) return <div>No interviews found. Create your first interview!</div>;

  return (
    <div className="interviews-list">
      {interviews.map(interview => (
        <InterviewCard key={interview.id} interview={interview} />
      ))}
    </div>
  );
}

// Interview card component
function InterviewCard({ interview }: { interview: InterviewType }) {
  // Format date
  const formattedDate = new Date(interview.date).toLocaleDateString();
  const formattedTime = new Date(interview.date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="interview-card">
      <h3>{interview.title}</h3>
      <p className="company">{interview.company}</p>
      <p className="position">{interview.position}</p>
      <p className="date-time">
        {formattedDate} at {formattedTime}
        {interview.duration && ` (${interview.duration} minutes)`}
      </p>
      <div className={`status status-${interview.status}`}>
        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
      </div>
      {interview.status === "completed" && interview.result && (
        <div className={`result result-${interview.result}`}>
          {interview.result.charAt(0).toUpperCase() + interview.result.slice(1)}
        </div>
      )}
    </div>
  );
}
```

## Updating Interviews

### Update Interview Status

```typescript
import { updateInterview } from "../actions/FirebaseUserApi";

const updateInterviewStatus = async (
  interviewId: string, 
  status: 'scheduled' | 'completed' | 'cancelled'
) => {
  try {
    await updateInterview(interviewId, { status });
    return true;
  } catch (error) {
    console.error("Failed to update interview status:", error);
    return false;
  }
};
```

### Update Interview Result

```typescript
const updateInterviewResult = async (
  interviewId: string,
  result: 'pending' | 'passed' | 'failed' | 'unknown',
  feedback?: string
) => {
  try {
    const updates = {
      result,
      feedback,
      status: 'completed' as const
    };
    
    await updateInterview(interviewId, updates);
    return true;
  } catch (error) {
    console.error("Failed to update interview result:", error);
    return false;
  }
};
```

### Edit Interview Form

Create a form to edit existing interviews:

```tsx
import { useEffect, useState } from "react";
import { getInterview, updateInterview } from "../actions/FirebaseUserApi";
import type { InterviewType } from "../types/user";

interface EditInterviewFormProps {
  interviewId: string;
  onSuccess?: () => void;
}

export function EditInterviewForm({ interviewId, onSuccess }: EditInterviewFormProps) {
  const [interview, setInterview] = useState<InterviewType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "",
    company: "",
    position: "",
    status: "",
    notes: "",
    result: "",
    feedback: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const interviewData = await getInterview(interviewId);
        setInterview(interviewData);
        
        // Format date and time for form inputs
        const interviewDate = new Date(interviewData.date);
        const dateString = interviewDate.toISOString().split('T')[0];
        const timeString = interviewDate.toTimeString().slice(0, 5);
        
        setFormData({
          title: interviewData.title,
          description: interviewData.description || "",
          date: dateString,
          time: timeString,
          duration: interviewData.duration?.toString() || "",
          company: interviewData.company || "",
          position: interviewData.position || "",
          status: interviewData.status,
          notes: interviewData.notes || "",
          result: interviewData.result || "",
          feedback: interviewData.feedback || ""
        });
      } catch (error) {
        setError("Failed to load interview");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterview();
  }, [interviewId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    setError("");
    setSuccess(false);
    
    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const updateData: Partial<InterviewType> = {
        title: formData.title,
        description: formData.description || undefined,
        date: dateTime.getTime(),
        duration: formData.duration ? parseInt(formData.duration, 10) : undefined,
        company: formData.company || undefined,
        position: formData.position || undefined,
        status: formData.status as 'scheduled' | 'completed' | 'cancelled',
        notes: formData.notes || undefined
      };
      
      // Add result and feedback if completed
      if (formData.status === 'completed') {
        updateData.result = (formData.result || 'pending') as 'pending' | 'passed' | 'failed' | 'unknown';
        updateData.feedback = formData.feedback || undefined;
      }
      
      await updateInterview(interviewId, updateData);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError("Failed to update interview");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading interview data...</div>;
  if (error && !interview) return <div className="error">{error}</div>;
  if (!interview) return <div>Interview not found</div>;

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Interview updated successfully!</div>}
      
      {/* Form fields */}
      {/* ... */}
      
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
```

## Deleting Interviews

```typescript
import { deleteInterview } from "../actions/FirebaseUserApi";

const removeInterview = async (interviewId: string) => {
  try {
    await deleteInterview(interviewId);
    return true;
  } catch (error) {
    console.error("Failed to delete interview:", error);
    return false;
  }
};
```

## Interview Statistics

### Calculate User Statistics

```typescript
import type { InterviewType, UserStatsType } from "../types/user";

const calculateUserStats = (interviews: InterviewType[]): UserStatsType => {
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled').length;
  
  // Calculate pass rate
  const completedWithResult = interviews.filter(
    i => i.status === 'completed' && (i.result === 'passed' || i.result === 'failed')
  );
  const passedInterviews = completedWithResult.filter(i => i.result === 'passed').length;
  const passRate = completedWithResult.length > 0 
    ? (passedInterviews / completedWithResult.length) * 100 
    : undefined;
  
  // Calculate average score
  const interviewsWithScore = interviews.filter(i => i.score !== undefined);
  const averageScore = interviewsWithScore.length > 0
    ? interviewsWithScore.reduce((sum, i) => sum + (i.score || 0), 0) / interviewsWithScore.length
    : undefined;
  
  // Find most recent interview
  const sortedInterviews = [...interviews].sort((a, b) => b.date - a.date);
  const mostRecentInterview = sortedInterviews.length > 0 ? sortedInterviews[0].id : undefined;
  
  return {
    totalInterviews,
    completedInterviews,
    upcomingInterviews,
    passRate,
    averageScore,
    mostRecentInterview,
    lastActive: Date.now()
  };
};
```

### Display Statistics Dashboard

```tsx
import { useEffect, useState } from "react";
import { getUserInterviews, updateUserStats } from "../actions/FirebaseUserApi";
import { useAuth } from "../hooks/useAuth";
import type { InterviewType, UserStatsType } from "../types/user";

export function StatsDashboard() {
  const { userData } = useAuth();
  const [interviews, setInterviews] = useState<InterviewType[]>([]);
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) return;
      
      try {
        const userInterviews = await getUserInterviews(userData.uid);
        setInterviews(userInterviews);
        
        // Use existing stats or calculate new ones
        const userStats = userData.stats || calculateUserStats(userInterviews);
        setStats(userStats);
        
        // Update stats in database if needed
        if (!userData.stats || userData.stats.totalInterviews !== userInterviews.length) {
          const newStats = calculateUserStats(userInterviews);
          await updateUserStats(userData.uid, newStats);
        }
      } catch (error) {
        setError("Failed to load statistics");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData?.uid, userData?.stats]);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return <div>No statistics available</div>;

  return (
    <div className="stats-dashboard">
      <h2>Interview Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Interviews</h3>
          <div className="stat-value">{stats.totalInterviews}</div>
        </div>
        
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value">{stats.completedInterviews}</div>
        </div>
        
        <div className="stat-card">
          <h3>Upcoming</h3>
          <div className="stat-value">{stats.upcomingInterviews}</div>
        </div>
        
        <div className="stat-card">
          <h3>Success Rate</h3>
          <div className="stat-value">
            {stats.passRate !== undefined ? `${stats.passRate.toFixed(1)}%` : 'N/A'}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Average Score</h3>
          <div className="stat-value">
            {stats.averageScore !== undefined ? stats.averageScore.toFixed(1) : 'N/A'}
          </div>
        </div>
      </div>
      
      {/* Additional stats or charts can be added here */}
    </div>
  );
}
```

## Best Practices for Interview Management

1. **Data Validation**: Always validate interview data before saving to the database.

2. **Date Handling**: Store dates as timestamps (milliseconds since epoch) for consistent handling across timezones.

3. **Status Transitions**: Implement proper status transitions:
   - Scheduled → Completed
   - Scheduled → Cancelled
   - Avoid invalid transitions (e.g., Cancelled → Completed)

4. **Real-time Updates**: Consider implementing real-time updates for interview status changes using Firebase's real-time capabilities.

5. **Calendar Integration**: For advanced functionality, integrate with calendar APIs (Google Calendar, Outlook) for reminders.

6. **Batch Operations**: When updating multiple interviews or calculating statistics, use batch operations to minimize database writes.

7. **Offline Support**: Implement offline support for interview management, allowing users to create and edit interviews without an internet connection.
