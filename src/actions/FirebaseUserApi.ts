import { auth, db, googleProvider } from "../service/Firebase";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import type { UserType, InterviewType, UserStatsType, RawFireStoreInterviewDataType, InterviewResults } from "../types/user";

import type { UserUpdateType } from "../schemas/userSchema";
import { userUpdateSchema } from "../schemas/userSchema";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { handleApiError } from "@/utils/handleApiError";

// Response Type

export type Response<T> =
  | { success:true; data?: T}
  | { success:false; error: {code:string; message:string}}





/**
 * Add or Create User
 * Creates a new user document in Firestore
 */
export const createUser = async (
  uid: string,
  userData: Partial<UserType>
): Promise<void> => {
  try {
    const timestamp = Date.now();
    const newUser: UserType = {
      uid,
      email: userData.email!,
      createdAt: timestamp,
      updatedAt: timestamp,
      stats: {
        totalInterviews: 0,
        completedInterviews: 0,
        upcomingInterviews: 0,
      },
      ...userData,
    };
    await setDoc(doc(db, "users", uid), newUser);
  } catch (error) {
    console.error("Failed to save user:", error);
    throw new Error("Failed to create user account");
  }
};

/**
 * Login With Google
 * Handles Google OAuth authentication
 */
export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// signupWithEmailAndPassword

export const signUp = async (name: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const timestamp = Date.now();

    await createUser(userCredential.user.uid, {
      uid: userCredential.user.uid,
      name,
      email,
      createdAt: timestamp,
      authProvider: "email",
    });

    return { success: true };
  } catch (error: unknown) {
    let code = "unknown";
    let message = "Signup failed. Please try again.";

    if (typeof error === "object" && error !== null && "code" in error) {
      code = (error as { code: string }).code;

      switch (code) {
        case "auth/email-already-in-use":
          message = "Email is already in use.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
      }
    }

    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  }
};

//loginWithEmailAndPassword

export const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: unknown) {
    let code = "unknown";
    let message = "Login Failed. Please try again.";

    if (typeof error === "object" && error !== null && "code" in error) {
      code = (error as { code: string }).code;

      switch (code) {
        case "auth/user-not-found":
          message = "No user found with this Email.";
          break;
        case "auth/wrong-password":
          message = "Invalid Credentials";
          break;

        case "auth/invalid-email":
          message = "Invalid Credentials";
          break;
        case "auth/invalid-credential":
          message = "Invalid Credentials";
          break;
      }
    }
    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  }
};

/**
 * Sign out the current user
 */
export const SignoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Unable to Logout");
  }
};

/**
 * Get User Data
 * Retrieves a user's data from Firestore
 */
export const getUser = async (uid: string): Promise<UserType | null> => {
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    return userSnap.exists() ? (userSnap.data() as UserType) : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

/**
 * Update user data
 * Updates user profile information
 */
export const updateUser = async (uid: string, updates: UserUpdateType) => {
  try {
    // Validate the updates against the schema
    const result = userUpdateSchema.safeParse(updates);

    if (!result.success) {
      // Extract and format validation errors
      const formattedErrors = result.error.format();
      console.error("Validation errors:", formattedErrors);

      // Get the first error message for better user feedback
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );

      throw new Error(
        errorMessages.length > 0
          ? `Invalid User Data: ${errorMessages[0]}`
          : "Invalid User Data"
      );
    }

    // Add updated timestamp
    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };
    const reponse = await updateDoc(doc(db, "users", uid), updatedData);
    console.log(reponse);
    return { success: true };
  } catch (error: unknown) {
    const code = "unknown";
    const message = "Failed to save data!";

    if (error instanceof Error) {
      return {
        success: false,
        error: {
          message: error.message || message,
          code: code,
        },
      };
    }

    return {
      success: false,
      error: {
        message,
        code,
      },
    };
  }
};

/**
 * Delete User
 * Removes a user document from Firestore
 */
export const deleteUser = async (uid: string): Promise<Error | void> => {
  try {
    await deleteDoc(doc(db, "users", uid));
  } catch (error: unknown) {
    if (error instanceof Error) return error;
    throw new Error("An unexpected Error has occurred!");
  }
};


//Create a new interview for a user
// Need to fix wrong type casting

export const createInterview = async <T>(
  uid: string,
  id: string,
  interviewData: Partial<InterviewType>
): Promise<Response<T>> => {
  try {
    const interviewRef = doc(collection(db, "users", uid, "interviews"), id);

    // Make a copy of interviewData to avoid modifying the original object
    const processedData = { ...interviewData };    // Process date if it exists and is a Date object
    if (interviewData.date) {
      const dateValue = interviewData.date as string | Date;
      if (dateValue instanceof Date) {
        // Store the date as an ISO string for consistency
        processedData.date = dateValue.toISOString();
      } else if (typeof interviewData.date === 'string') {
        // Ensure string date is in a valid format
        try {
          // Try to parse the string as a date and convert back to ISO
          const dateObj = new Date(interviewData.date);
          if (!isNaN(dateObj.getTime())) {
            processedData.date = dateObj.toISOString();
          }
        } catch (error) {
          console.error("Error parsing date string:", error);
          // Keep original date string if parsing fails
        }
      }
    }

    const createdInterview = {
      ...processedData,
      id,
      userId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as T & Partial<InterviewType>
    
    console.log('This data is saved ')
    // Create the interview document
    await setDoc(interviewRef, createdInterview);

    return { success: true, data: createdInterview};
  } catch (error: unknown) {
    return handleApiError(error, "create-interview-failed");
  }
};

// Get user's interviews

export const getAllUserInterview = async <T= InterviewType>(
  uid: string,
  limitedBy: number = 10
): Promise<Response<T[]>> => {
  try {
    const q = query(
      collection(db, "users", uid, "interviews"),
      orderBy("date", "asc"),
      limit(limitedBy)
    );

    const snap = await getDocs(q);

    const interviews = snap.docs.map((doc) => {
      const data = doc.data() as RawFireStoreInterviewDataType // Raw type
      
      // Handle date conversion safely
      let dateValue;
      try {
        // Check if date is a Firestore Timestamp
        if (data.date && typeof data.date === 'object' && 'toDate' in data.date) {
          dateValue = data.date.toDate();
        } else if (typeof data.date === 'string') {
          // If it's a string, parse it
          dateValue = new Date(data.date);
        } else if (typeof data.date === 'number') {
          // If it's a timestamp number
          dateValue = new Date(data.date);
        } else {
          // Fallback
          dateValue = new Date();
          console.warn("Date format not recognized for interview", doc.id);
        }
      } catch (error) {
        console.error("Error converting date:", error);
        // Fallback to current date if conversion fails
        dateValue = new Date();
      }

      // Handle createdAt conversion safely
      let createdAtValue;
      try {
        // Check if createdAt is a Firestore Timestamp
        if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
          createdAtValue = data.createdAt.toDate();
        } else if (typeof data.createdAt === 'string') {
          // If it's a string, parse it
          createdAtValue = new Date(data.createdAt);
        } else if (typeof data.createdAt === 'number') {
          // If it's a timestamp number
          createdAtValue = new Date(data.createdAt);
        } else {
          // Fallback
          createdAtValue = new Date();
          console.warn("CreatedAt format not recognized for interview", doc.id);
        }
      } catch (error) {
        console.error("Error converting createdAt:", error);
        // Fallback to current date if conversion fails
        createdAtValue = new Date();
      }
      
      return {
        ...data,
        id: doc.id,
        date: dateValue,
        createdAt: createdAtValue
      }
    }) as T[];
    
    return { success: true, data: interviews };
  } catch (error: unknown) {
    return handleApiError(error, "get-interview-failed");
  }
};

// Get a Interview Details

export const getAInterviewDetail = async <T>(
  uid: string,
  interviewId: string
): Promise<Response<T>> => {
  try {
    const interviewRef = doc(db, "users", uid, "interviews", interviewId);
    const snap = await getDoc(interviewRef);
    
    if (!snap.exists()) {
      return { 
        success: false, 
        error: { 
          code: "not-found", 
          message: "Interview not found" 
        } 
      };
    }
    
    const rawData = snap.data() as RawFireStoreInterviewDataType;
    
    // Handle date conversion safely
    let dateValue;
    try {
      // Check if date is a Firestore Timestamp
      if (rawData.date && typeof rawData.date === 'object' && 'toDate' in rawData.date) {
        dateValue = rawData.date.toDate();
      } else if (typeof rawData.date === 'string') {
        // If it's a string, parse it
        dateValue = new Date(rawData.date);
      } else if (typeof rawData.date === 'number') {
        // If it's a timestamp number
        dateValue = new Date(rawData.date);
      } else {
        // Fallback
        dateValue = new Date();
        console.warn("Date format not recognized for interview", snap.id);
      }
    } catch (error) {
      console.error("Error converting date:", error);
      // Fallback to current date if conversion fails
      dateValue = new Date();
    }    // Handle createdAt conversion safely
    let createdAtValue;
    try {
      // Check if createdAt is a Firestore Timestamp
      if (rawData.createdAt && typeof rawData.createdAt === 'object' && 'toDate' in rawData.createdAt) {
        createdAtValue = rawData.createdAt.toDate();
      } else if (typeof rawData.createdAt === 'string') {
        // If it's a string, parse it
        createdAtValue = new Date(rawData.createdAt);
      } else if (typeof rawData.createdAt === 'number') {
        // If it's a timestamp number
        createdAtValue = new Date(rawData.createdAt);
      } else {
        // Fallback
        createdAtValue = new Date();
        console.warn("CreatedAt format not recognized for interview", snap.id);
      }
    } catch (error) {
      console.error("Error converting createdAt:", error);
      // Fallback to current date if conversion fails
      createdAtValue = new Date();
    }
    
    const data = {
      ...rawData,
      id: snap.id,
      date: dateValue,
      createdAt: createdAtValue
    } as unknown as T;
    
    return { success: true, data };
  } catch (error:unknown) {
    return handleApiError(error,'get-A-interview-failed')
  }
};

// Update user interview details

export const updateInterview = async <T>(
  interviewId: string,
  uid: string,
  updates: Partial<InterviewType>
): Promise<Response<T>> => {
  try {
    console.log("updateInterview called with:", { interviewId, uid, updates });
    
    const interviewRef = doc(db, "users", uid, "interviews", interviewId);
    const interviewDoc = await getDoc(interviewRef);

    if (!interviewDoc.exists()) {
      console.log("Interview not found:", interviewId);
      return { 
        success: false, 
        error: { 
          code: "not-found", 
          message: "Interview not found" 
        } 
      };
    }    // Make a copy of updates to avoid modifying the original object
    const processedUpdates: Record<string, unknown> = { ...updates };// Process date if it exists in the updates
    if (updates.date) {
      const dateValue = updates.date as string | Date; // Type assertion for date handling
      console.log("Processing date value:", dateValue, "Type:", typeof dateValue);
      
      if (dateValue instanceof Date) {
        // Store the date as an ISO string for consistency
        processedUpdates.date = dateValue.toISOString();
        console.log("Converted Date to ISO string:", processedUpdates.date);
      } else if (typeof dateValue === 'string') {
        // Ensure string date is in a valid format
        try {
          const dateObj = new Date(dateValue);
          if (!isNaN(dateObj.getTime())) {
            processedUpdates.date = dateObj.toISOString();
            console.log("Converted string date to ISO string:", processedUpdates.date);
          } else {
            console.error("Invalid date string:", dateValue);
          }
        } catch (error) {
          console.error("Error parsing date string:", error);
          // Keep original date string if parsing fails
        }
      }
    }

    // Remove undefined values to avoid Firestore errors
    Object.keys(processedUpdates).forEach(key => {
      if (processedUpdates[key] === undefined) {
        console.log("Removing undefined value for key:", key);
        delete processedUpdates[key];
      }
    });

    console.log("Final processed updates:", processedUpdates);

    // Update the interview document
    await updateDoc(interviewRef, {
      ...processedUpdates,
      updatedAt: serverTimestamp(),
    });

    console.log("Interview updated successfully");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating interview:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return handleApiError(error, 'update-interview-error');
  }
};

/**
 * Delete an interview
 */
export const deleteInterview = async (interviewId: string): Promise<void> => {
  try {
    const interviewRef = doc(db, "interviews", interviewId);
    const interviewDoc = await getDoc(interviewRef);

    if (!interviewDoc.exists()) {
      throw new Error("Interview not found");
    }

    const interviewData = interviewDoc.data() as InterviewType & {
      userId: string;
    };
    const userId = interviewData.userId;

    // Delete the interview document
    await deleteDoc(interviewRef);

    // Update the user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserType;
      const interviewIds = userData.interviewIds || [];
      const stats = userData.stats || {
        totalInterviews: 0,
        completedInterviews: 0,
        upcomingInterviews: 0,
      };

      // Update stats
      stats.totalInterviews = Math.max(0, stats.totalInterviews - 1);
      if (interviewData.status === "scheduled") {
        stats.upcomingInterviews = Math.max(0, stats.upcomingInterviews - 1);
      } else if (interviewData.status === "completed") {
        stats.completedInterviews = Math.max(0, stats.completedInterviews - 1);
      }

      // Remove interview from user document
      await updateDoc(userRef, {
        interviewIds: interviewIds.filter((id) => id !== interviewId),
        [`interviews.${interviewId}`]: deleteDoc,
        stats,
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error("Failed to delete interview:", error);
    throw new Error("Failed to delete interview");
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  uid: string,
  preferences: UserType["preferences"]
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", uid), {
      preferences,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    throw new Error("Failed to update preferences");
  }
};

/**
 * Update user stats
 */
export const updateUserStats = async (
  uid: string,
  stats: Partial<UserStatsType>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data() as UserType;
    const currentStats = userData.stats || {
      totalInterviews: 0,
      completedInterviews: 0,
      upcomingInterviews: 0,
    };

    await updateDoc(userRef, {
      stats: {
        ...currentStats,
        ...stats,
      },
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update user stats:", error);
    throw new Error("Failed to update user statistics");
  }
};


/**
 * PHASE 2: Interview Progress & Completion API Functions
 * These functions support real-time progress saving and interview completion workflow
 */

/**
 * Save interview answers and progress during the interview
 * Allows users to resume if they leave and return
 */
export const saveInterviewProgress = async (
  interviewId: string,
  uid: string,
  answers: Array<{ questionId: string; text: string; answeredAt: Date }>,
  currentQuestionIndex: number
): Promise<Response<void>> => {
  try {
    const interviewRef = doc(db, "users", uid, "interviews", interviewId);
    
    const progressData = {
      answers,
      currentQuestionIndex,
      answersSubmitted: answers.length,
      lastAnsweredAt: new Date(),
      status: 'in-progress' as const,
      updatedAt: Date.now()
    };

    await updateDoc(interviewRef, progressData);
    
    console.log(`Interview progress saved for ${interviewId}, ${answers.length} answers`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save interview progress:", error);
    return handleApiError(error, 'save-progress-error');
  }
};

/**
 * Complete interview and save comprehensive results
 * This function is called when the interview is finished and AI feedback is generated
 */
export const completeInterview = async (
  interviewId: string,
  uid: string,
  results: InterviewResults
): Promise<Response<void>> => {
  try {
    const interviewRef = doc(db, "users", uid, "interviews", interviewId);
    
    const completionData = {
      results,
      completedAt: new Date(),
      status: 'completed' as const,
      score: results.summary.overallScore,
      timeSpent: results.summary.timeSpent,
      feedback: `Overall Score: ${results.summary.overallScore}% - ${results.summary.performance}`,
      result: results.summary.overallScore >= 70 ? 'passed' as const : 'failed' as const,
      updatedAt: Date.now()
    };

    await updateDoc(interviewRef, completionData);
    
    console.log(`Interview completed: ${interviewId} with score ${results.summary.overallScore}%`);
    return { success: true };
  } catch (error) {
    console.error("Failed to complete interview:", error);
    return handleApiError(error, 'complete-interview-error');
  }
};

/**
 * Get comprehensive interview results
 * Retrieves the full interview results including AI feedback
 */
export const getInterviewResults = async (
  interviewId: string,
  uid: string
): Promise<Response<InterviewResults>> => {
  try {
    const interviewRef = doc(db, "users", uid, "interviews", interviewId);
    const interviewDoc = await getDoc(interviewRef);

    if (!interviewDoc.exists()) {
      return {
        success: false,
        error: { code: "not-found", message: "Interview not found" }
      };
    }

    const interviewData = interviewDoc.data() as InterviewType;
    
    if (!interviewData.results) {
      return {
        success: false,
        error: { code: "no-results", message: "Interview results not available" }
      };
    }

    return { success: true, data: interviewData.results };
  } catch (error) {
    console.error("Failed to get interview results:", error);
    return handleApiError(error, 'get-results-error');
  }
};

/**
 * Update user interview statistics after completing an interview
 * This function calculates and updates comprehensive user statistics
 */
export const updateUserInterviewStats = async (
  uid: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interviewResults: InterviewResults // Available for future analytics and skill-specific tracking
): Promise<Response<void>> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        error: { code: "user-not-found", message: "User not found" }
      };
    }

    const userData = userDoc.data() as UserType;
    const currentStats = userData.stats || {
      totalInterviews: 0,
      completedInterviews: 0,
      upcomingInterviews: 0,
    };

    // Get all user interviews to calculate comprehensive stats
    const interviewsQuery = query(
      collection(db, "users", uid, "interviews"),
      orderBy("createdAt", "desc")
    );
    const interviewsSnapshot = await getDocs(interviewsQuery);
    const allInterviews = interviewsSnapshot.docs.map(doc => doc.data() as InterviewType);

    // Calculate updated statistics
    const completedInterviews = allInterviews.filter(i => i.status === 'completed');
    const upcomingInterviews = allInterviews.filter(i => i.status === 'scheduled');
    
    // Calculate pass rate
    const interviewsWithResults = completedInterviews.filter(i => i.result && i.result !== 'pending');
    const passedInterviews = interviewsWithResults.filter(i => i.result === 'passed');
    const passRate = interviewsWithResults.length > 0 
      ? (passedInterviews.length / interviewsWithResults.length) * 100 
      : undefined;

    // Calculate average score
    const interviewsWithScores = completedInterviews.filter(i => typeof i.score === 'number');
    const averageScore = interviewsWithScores.length > 0
      ? interviewsWithScores.reduce((sum, i) => sum + (i.score || 0), 0) / interviewsWithScores.length
      : undefined;

    // Find most recent interview
    const sortedInterviews = [...allInterviews].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const mostRecentInterview = sortedInterviews.length > 0 ? sortedInterviews[0].id : undefined;    // Calculate streak days - increment if this interview was completed today
    const lastInterviewDate = sortedInterviews.length > 1 ? new Date(sortedInterviews[1].createdAt) : null;
    const today = new Date();
    let streakDays = currentStats.streakDays || 0;
    
    if (lastInterviewDate) {
      const daysDiff = Math.floor((today.getTime() - lastInterviewDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        streakDays += 1; // Continue streak
      } else if (daysDiff > 1) {
        streakDays = 1; // Reset streak
      }
    } else {
      streakDays = 1; // First interview
    }

    const updatedStats: UserStatsType = {
      totalInterviews: allInterviews.length,
      completedInterviews: completedInterviews.length,
      upcomingInterviews: upcomingInterviews.length,
      passRate,
      averageScore,
      mostRecentInterview,
      streakDays,
      lastActive: Date.now()
    };

    await updateDoc(userRef, {
      stats: updatedStats,
      updatedAt: Date.now(),
    });

    console.log(`Updated user stats for ${uid}:`, updatedStats);
    return { success: true };
  } catch (error) {
    console.error("Failed to update user interview stats:", error);
    return handleApiError(error, 'update-stats-error');
  }
};

/**
 * Start an interview and update its status
 * This function is called when a user begins taking an interview
 */
export const startInterview = async (
  interviewId: string,
  uid: string
): Promise<Response<void>> => {
  try {
    const interviewRef = doc(db, "users", uid, "interviews", interviewId);
    
    const startData = {
      startedAt: new Date(),
      status: 'in-progress' as const,
      currentQuestionIndex: 0,
      answersSubmitted: 0,
      updatedAt: Date.now()
    };

    await updateDoc(interviewRef, startData);
    
    console.log(`Interview started: ${interviewId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to start interview:", error);
    return handleApiError(error, 'start-interview-error');
  }
};

/**
 * Resume an in-progress interview
 * Retrieves the current progress and allows user to continue where they left off
 */
export const resumeInterview = async (
  interviewId: string,
  uid: string
): Promise<Response<{
  currentQuestionIndex: number;
  answers: Array<{ questionId: string; text: string; answeredAt: Date }>;
  timeSpent: number;
}>> => {
  try {
    const interviewRef = doc(db, "users", uid, "interviews", interviewId);
    const interviewDoc = await getDoc(interviewRef);

    if (!interviewDoc.exists()) {
      return {
        success: false,
        error: { code: "not-found", message: "Interview not found" }
      };
    }

    const interviewData = interviewDoc.data() as InterviewType;
    
    if (interviewData.status !== 'in-progress') {
      return {
        success: false,
        error: { code: "not-in-progress", message: "Interview is not in progress" }
      };
    }

    // Calculate time spent so far
    const startTime = interviewData.startedAt ? new Date(interviewData.startedAt).getTime() : Date.now();
    const timeSpent = Math.floor((Date.now() - startTime) / 60000); // in minutes

    const progressData = {
      currentQuestionIndex: interviewData.currentQuestionIndex || 0,
      answers: interviewData.answers || [],
      timeSpent
    };

    return { success: true, data: progressData };
  } catch (error) {
    console.error("Failed to resume interview:", error);
    return handleApiError(error, 'resume-interview-error');
  }
};


// Custom roadmap type definition
interface CustomRoadmapData {
  id: string;
  title: string;
  topics: string; // Detailed topic description  
  targetLevel: 'zero-to-advanced' | 'medium-level' | 'advanced-level';
  timeInvestment: number; // hours per week
  includeLearningMaterials: boolean;
  goal: string; // What they want to achieve
  description?: string;
  category: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  // Generated roadmap data
  generatedTopics?: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    estimatedHours: number;
    resources?: Array<{
      type: string;
      title: string;
      url: string;
      duration?: string;
    }>;
  }>;  estimatedDuration?: string;
  status?: 'draft' | 'published' | 'in-progress' | 'completed';
  [key: string]: unknown;
}

/**
 * Save a custom roadmap to Firebase
 */
export const saveCustomRoadmap = async (
  roadmap: CustomRoadmapData
): Promise<Response<void>> => {
  try {
    const docRef = doc(db, 'custom-roadmaps', roadmap.id);
    await setDoc(docRef, {
      ...roadmap,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save custom roadmap:", error);
    return handleApiError(error, 'save-custom-roadmap-error');
  }
};

/**
 * Get all custom roadmaps for a user
 */
export const getUserCustomRoadmaps = async (
  userId: string,
  limitCount: number = 20
): Promise<Response<CustomRoadmapData[]>> => {
  try {
    const q = query(
      collection(db, 'custom-roadmaps'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const roadmaps = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as CustomRoadmapData))
      .filter(roadmap => roadmap.createdBy === userId);

    return { success: true, data: roadmaps };
  } catch (error) {
    console.error("Failed to get custom roadmaps:", error);
    return handleApiError(error, 'get-custom-roadmaps-error');
  }
};

/**
 * Get a specific custom roadmap by ID
 */
export const getCustomRoadmap = async (
  roadmapId: string
): Promise<Response<CustomRoadmapData>> => {
  try {
    const docRef = doc(db, 'custom-roadmaps', roadmapId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        error: {
          code: 'roadmap-not-found',
          message: 'Custom roadmap not found'
        }
      };
    }

    const roadmapData = { id: docSnap.id, ...docSnap.data() } as CustomRoadmapData;
    return { success: true, data: roadmapData };
  } catch (error) {
    console.error("Failed to get custom roadmap:", error);
    return handleApiError(error, 'get-custom-roadmap-error');
  }
};

/**
 * Update a custom roadmap
 */
export const updateCustomRoadmap = async (
  roadmapId: string,
  updates: Partial<CustomRoadmapData>
): Promise<Response<void>> => {
  try {
    const docRef = doc(db, 'custom-roadmaps', roadmapId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update custom roadmap:", error);
    return handleApiError(error, 'update-custom-roadmap-error');
  }
};

/**
 * Delete a custom roadmap
 */
export const deleteCustomRoadmap = async (
  roadmapId: string
): Promise<Response<void>> => {
  try {
    const docRef = doc(db, 'custom-roadmaps', roadmapId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete custom roadmap:", error);
    return handleApiError(error, 'delete-custom-roadmap-error');
  }
};
