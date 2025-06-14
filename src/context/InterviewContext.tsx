import React, { createContext, useContext, useState } from 'react';

// Define the interview data types
interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Answer {
  questionId: string;
  text: string;
}

interface InterviewData {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  startedAt?: Date;
  completedAt?: Date;
}

interface InterviewContextType {
  interview: InterviewData | null;
  currentQuestionIndex: number;
  answers: Answer[];
  isLoading: boolean;
  isCompleted: boolean;
  
  // Methods
  startInterview: () => void;
  setInterview: (interview: InterviewData) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  saveAnswer: (questionId: string, text: string) => void;
  finishInterview: () => void;
}

// Create the context with a default value
const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

// Create a provider component
export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {  const [interview, setInterviewData] = useState<InterviewData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startInterview = () => {
    if (interview) {
      setIsLoading(true);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setIsCompleted(false);
      // Set startedAt to now
      setInterviewData({
        ...interview,
        startedAt: new Date(),
        completedAt: undefined
      });
      setIsLoading(false);
    }
  };

  const setInterview = (interviewData: InterviewData) => {
    setInterviewData(interviewData);
  };

  const nextQuestion = () => {
    if (interview && currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const saveAnswer = (questionId: string, text: string) => {
    setAnswers(prevAnswers => {
      // Check if an answer already exists for this question
      const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
      
      if (existingAnswerIndex !== -1) {
        // Update existing answer
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = { questionId, text };
        return updatedAnswers;
      } else {
        // Add new answer
        return [...prevAnswers, { questionId, text }];
      }
    });
  };
  const finishInterview = () => {
    if (interview) {
      setIsLoading(true);
      setIsCompleted(true);
      // Set completedAt to now
      setInterviewData({
        ...interview,
        completedAt: new Date()
      });
      setIsLoading(false);
    }
  };

  const value = {
    interview,
    currentQuestionIndex,
    answers,
    isLoading,
    isCompleted,
    startInterview,
    setInterview,
    nextQuestion,
    previousQuestion,
    saveAnswer,
    finishInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

// Create a hook for using the context
export const useInterview = (): InterviewContextType => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

// Export the Question and Answer types for reuse
export type { Question, Answer, InterviewData };
