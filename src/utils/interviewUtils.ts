// filepath: src/utils/interviewUtils.ts
import { InterviewSuggestion } from "@/service/GeminiService";

export interface Interview {
  id: string;
  title: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  field: "it" | "cs" | "other";
  type: "frontend" | "backend" | "fullstack" | "devops" | "other";
  emailNotification: boolean;
  date: string;
  notes?: string;
  createdAt: Date;
}

/**
 * Creates an interview from an AI suggestion without saving it to localStorage
 */
export function createInterviewFromSuggestion(suggestion: InterviewSuggestion): Interview {
  // Generate a unique ID for the interview
  const id = `interview_${Date.now()}`;
    // Create the interview object
  const interview: Interview = {
    id,
    title: suggestion.title,
    description: suggestion.description,
    difficulty: mapSuggestionDifficulty(suggestion.difficulty),
    field: "it", // Default to IT as most suggestions are tech-related
    type: mapSuggestionType(suggestion.type),
    emailNotification: false,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
    notes: `Created from AI suggestion. Focus areas: ${suggestion.focus?.join(', ') || 'General interview preparation'}`,
    createdAt: new Date(),
  };

  return interview;
}

/**
 * Utility function to convert an interview type
 */
export function mapSuggestionType(type: string): Interview['type'] {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('frontend') || lowerType.includes('front-end')) return 'frontend';
  if (lowerType.includes('backend') || lowerType.includes('back-end')) return 'backend';
  if (lowerType.includes('fullstack') || lowerType.includes('full-stack') || lowerType.includes('full stack')) return 'fullstack';
  if (lowerType.includes('devops') || lowerType.includes('dev-ops')) return 'devops';
  return 'other';
}

/**
 * Utility function to convert difficulty levels
 */
export function mapSuggestionDifficulty(difficulty: string): Interview['difficulty'] {
  const lowerDifficulty = difficulty.toLowerCase();
  if (lowerDifficulty.includes('beginner') || lowerDifficulty.includes('entry') || lowerDifficulty.includes('junior')) return 'beginner';
  if (lowerDifficulty.includes('advanced') || lowerDifficulty.includes('senior') || lowerDifficulty.includes('expert')) return 'advanced';
  return 'intermediate';
}

/**
 * Gets all interviews from localStorage
 */
export function getAllInterviews(): Interview[] {
  return JSON.parse(localStorage.getItem("interviews") || "[]");
}

/**
 * Gets a specific interview by ID
 */
export function getInterviewById(id: string): Interview | null {
  const interviews = getAllInterviews();
  return interviews.find(interview => interview.id === id) || null;
}

/**
 * Deletes an interview by ID
 */
export function deleteInterview(id: string): boolean {
  const interviews = getAllInterviews();
  const updatedInterviews = interviews.filter(interview => interview.id !== id);
  localStorage.setItem("interviews", JSON.stringify(updatedInterviews));
  return interviews.length > updatedInterviews.length;
}
