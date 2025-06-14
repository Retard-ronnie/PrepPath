import { geminiService, type QuestionItem, type GenerateQuestionsParams } from '@/service/GeminiService';

/**
 * Utility functions for handling interview questions
 */

/**
 * Generate questions for an interview based on parameters
 */
export async function generateInterviewQuestions(params: {
  field: "it" | "cs" | "lg" | "other";
  type: "frontend" | "backend" | "fullstack" | "devops" | "other";
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  customType?: string;
  count?: number;
}): Promise<QuestionItem[]> {
  const questionParams: GenerateQuestionsParams = {
    field: params.field,
    type: params.type,
    difficulty: params.difficulty,
    customType: params.customType,
    count: params.count || 50
  };

  try {
    const questions = await geminiService.generateQuestions(questionParams);
    return questions;
  } catch (error) {
    console.error('Failed to generate questions:', error);
    throw new Error('Failed to generate interview questions. Please try again.');
  }
}

/**
 * Format questions for display in the UI
 */
export function formatQuestionsForDisplay(questions: QuestionItem[]): Array<{
  id: string;
  question: string;
  number: number;
}> {
  return questions.map((q, index) => ({
    id: q.qid,
    question: q.question,
    number: index + 1
  }));
}

/**
 * Convert questions to the format expected by InterviewType
 */
export function convertQuestionsToInterviewFormat(questions: QuestionItem[]): Array<{
  qid: string;
  question: string;
}> {
  return questions.map(q => ({
    qid: q.qid,
    question: q.question
  }));
}

/**
 * Get a subset of questions (useful for shorter interviews)
 */
export function getQuestionSubset(questions: QuestionItem[], count: number): QuestionItem[] {
  if (count >= questions.length) return questions;
  
  // Shuffle and take the first 'count' questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate questions and save them to localStorage (for testing purposes)
 */
export async function generateAndSaveQuestions(params: {
  field: "it" | "cs" | "lg" | "other";
  type: "frontend" | "backend" | "fullstack" | "devops" | "other";
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  customType?: string;
  count?: number;
}, storageKey: string = 'generated_questions'): Promise<QuestionItem[]> {
  try {
    const questions = await generateInterviewQuestions(params);
    
    // Save to localStorage for caching/testing
    localStorage.setItem(storageKey, JSON.stringify({
      questions,
      generatedAt: new Date().toISOString(),
      params
    }));
    
    return questions;
  } catch (error) {
    console.error('Failed to generate and save questions:', error);
    throw error;
  }
}

/**
 * Load questions from localStorage (for testing purposes)
 */
export function loadSavedQuestions(storageKey: string = 'generated_questions'): {
  questions: QuestionItem[];
  generatedAt: string;
  params: GenerateQuestionsParams;
} | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load saved questions:', error);
    return null;
  }
}

/**
 * Validate question parameters
 */
export function validateQuestionParams(params: Partial<GenerateQuestionsParams>): string[] {
  const errors: string[] = [];
  
  if (!params.field) {
    errors.push('Field is required');
  }
  
  if (!params.type) {
    errors.push('Type is required');
  }
  
  if (!params.difficulty) {
    errors.push('Difficulty is required');
  }
  
  if (params.field === 'other' && !params.customType) {
    errors.push('Custom type is required when field is "other"');
  }
  
  if (params.count && (params.count < 1 || params.count > 100)) {
    errors.push('Count must be between 1 and 100');
  }
  
  return errors;
}

// export {
//   generateInterviewQuestions,
//   formatQuestionsForDisplay,
//   convertQuestionsToInterviewFormat,
//   getQuestionSubset,
//   generateAndSaveQuestions,
//   loadSavedQuestions,
//   validateQuestionParams
// };
