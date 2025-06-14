import {z} from 'zod'

// Helper for URL fields that might be empty strings
const urlSchema = z.string().refine(
  (val) => {
    // Allow empty strings or valid URLs
    return val === "" || /^https?:\/\//.test(val);
  },
  { message: "Must be a valid URL or empty string" }
).nullable().optional();

// Basic user update schema for profile updates
export const userUpdateSchema = z.object({
    name: z.string().min(1, { message: "Name must be at least 1 character long" }).optional(),
    displayName: z.string().min(1, { message: "Display name must be at least 1 character long" }).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().min(1, {message: 'Email must be at least 1 character'}).optional(),
    photo: urlSchema,
    photoURL: urlSchema,
    bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
    location: z.string().nullable().optional(),
    website: urlSchema,
    phone: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    company: z.string().nullable().optional(),    education: z.array(
        z.object({
            institution: z.string().nullable().optional(),
            degree: z.string().nullable().optional(),
            fieldOfStudy: z.string().nullable().optional(),
            graduationYear: z.number().nullable().optional()
        })
    ).optional(),
    socialProfiles: z.object({
        linkedin: urlSchema,
        github: urlSchema,
        twitter: urlSchema,
        portfolio: urlSchema
    }).optional(),
    updatedAt: z.number().optional()
})

export type UserUpdateType = z.infer<typeof userUpdateSchema>

// Social profiles schema
export const socialProfilesSchema = z.object({
    linkedin: urlSchema,
    github: urlSchema,
    twitter: urlSchema,
    portfolio: urlSchema
})

// Education schema
export const educationSchema = z.object({
    institution: z.string().nullable().optional(),
    degree: z.string().nullable().optional(),
    fieldOfStudy: z.string().nullable().optional(),
    graduationYear: z.number().nullable().optional()
})

// User preferences schema
export const userPreferencesSchema = z.object({
    jobInterests: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    preferredCompanies: z.array(z.string()).optional(),
    notificationSettings: z.object({
        email: z.boolean().default(true),
        push: z.boolean().default(true),
        reminderHours: z.number().optional()
    }).optional(),
    theme: z.enum(['light', 'dark', 'system']).default('system').optional()
})

// Interview schema
export const interviewSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.number(),
    duration: z.number().optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']),
    notes: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    questions: z.array(z.string()).optional(),
    feedback: z.string().optional(),
    result: z.enum(['pending', 'passed', 'failed', 'unknown']).optional(),
    score: z.number().optional(),
    createdAt: z.number(),
    updatedAt: z.number()
})

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
})

export type LoginType = z.infer<typeof loginSchema>

// Register Schema
export const registerSchema = loginSchema.extend({
    name: z.string().min(1, { message: "Name must be at least 1 character long" }),
    confirmPassword : z.string()
}).refine((data)=> data.password === data.confirmPassword, {
    message: 'Password Does not match',
    path:["confirmPassword"]
})

export type RegisterType = z.infer<typeof registerSchema>

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
})

export type CompleteUserType = z.infer<typeof completeUserSchema>