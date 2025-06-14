import type { Timestamp } from "firebase/firestore";

/**
 * Interface for Answer data used in InterviewContext
 */
export interface Answer {
  questionId: string;
  text: string;
}

/**
 * Interface for Interview data
 */
export interface InterviewType {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // timestamp
  duration?: number; // in minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  company?: string;
  position?: string;
  emailNotification: boolean
  field: "it" | "cs" | 'lg' | "other";
  type: "frontend" | "backend" | "fullstack" | "devops" | "other";
  customType?: string | null; // For custom field types when field is "other"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
    
  questions?: Array<{
    qid:string;
    question: string;
  }>;

  // Progress tracking fields
  startedAt?: Date;
  completedAt?: Date;
  lastAnsweredAt?: Date;
  timeSpent?: number; // in minutes
  answersSubmitted?: number;
  currentQuestionIndex?: number;
  
  // User answers during interview
  answers?: Array<{
    questionId: string;
    text: string;
    answeredAt: Date;
  }>;

  // AI Generated post-interview results
  results?: InterviewResults;
  feedback?: string;
  result?: 'pending' | 'passed' | 'failed' | 'unknown';
  score?: number;

  // After interview analysis by AI
  analysis?: {
    wrongOrSkipped: string[],
    suggestions: string[]
  };

  createdAt: Date;
  updatedAt: number;
}

/**
 * Interface for comprehensive interview results
 */
export interface InterviewResults {
  summary: {
    overallScore: number;
    totalQuestions: number;
    answeredQuestions: number;
    timeSpent: number;
    averageTimePerQuestion: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
  };
  answers: Array<{
    questionId: string;
    question: string;
    answer: string;
    score: number;
    feedback: string;
    technicalAccuracy: number;
    completeness: number;
    clarity: number;
    strengths: string[];
    improvements: string[];
    keywords: string[];
  }>;
  skillsAssessment: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  generatedAt: Date;
}


export interface RawFireStoreInterviewDataType {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string | Timestamp; // Can be string or Firestore Timestamp
  duration?: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  company?: string;
  position?: string;
  emailNotification: boolean
  field: "it" | "cs" | 'lg' | "other";
  type: "frontend" | "backend" | "fullstack" | "devops" | "other";
  customType?: string; // For custom field types when field is "other"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
    
  questions?: Array<{
    eid:string;
    question: string;
  }>;

  // AI Generated post-interview

  feedback?: string;
  result?: 'pending' | 'passed' | 'failed' | 'unknown';
  score?: number;

  // After interview analysis by AI

  analysis?: {
    wrongOrSkipped: string[],
    suggestions: string[]
  };
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt: Timestamp; // Firestore Timestamp
}

/**
 * Interface for user suggestions/preferences
 */
export interface UserPreferencesType {
  jobInterests?: string[];
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredCompanies?: string[];
  notificationSettings?: {
    email: boolean;
    push: boolean;
    reminderHours?: number; // hours before interview to send reminder
  };
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Interface for user statistics
 */
export interface UserStatsType {
  totalInterviews: number;
  completedInterviews: number;
  upcomingInterviews: number;
  passRate?: number; // percentage
  averageScore?: number;
  mostRecentInterview?: string; // interview ID
  streakDays?: number; // consecutive days using the platform
  lastActive?: number; // timestamp
}

/**
 * Main User Type Interface
 * Accommodates both regular signup and OAuth (like Google) login
 */
export interface UserType {
  // Basic user info (required)
  uid: string;
  email: string;
  
  // Auth provider info
  authProvider?: 'email' | 'google' | 'github' | 'facebook';
  emailVerified?: boolean;
  
  // Name fields (handle both regular signup and OAuth variations)
  name?: string; // regular signup
  displayName?: string; // OAuth providers like Google
  firstName?: string;
  lastName?: string;
  
  // Profile information
  photo?: string; // profile image URL
  photoURL?: string; // alternate field for OAuth providers
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  
  // Professional info
  title?: string;
  company?: string;
  education?: {
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    graduationYear?: number;
  }[];
  
  // Social profiles
  socialProfiles?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  
  // Interview related data
  interviews?: Record<string, InterviewType>; // map of interview IDs to interview data
  interviewIds?: string[]; // list of interview IDs for quicker access
  nextInterviewId?: string; // reference to next upcoming interview
  
  // User preferences and statistics
  preferences?: UserPreferencesType;
  stats?: UserStatsType;
  
  // System fields
  createdAt: number; // timestamp when user was created
  updatedAt: number; // timestamp when user was last updated
  lastLogin?: number; // timestamp of last login
  
  // Subscription/plan information (if applicable)
  plan?: 'free' | 'premium' | 'enterprise';
  planExpiresAt?: number;
  
  // Firebase specific fields (for reference)
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}
