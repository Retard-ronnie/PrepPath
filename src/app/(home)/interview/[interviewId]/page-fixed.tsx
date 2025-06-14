"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { InterviewProvider, useInterview, type InterviewData } from "@/context/InterviewContext";

import InterviewLayout from "@/components/interview/InterviewLayout";
import InterviewQuestion from "@/components/interview/InterviewQuestion";
import InterviewControls from "@/components/interview/InterviewControls";
import EnhancedFeedbackDashboard from "@/components/interview/EnhancedFeedbackDashboard";
import InterviewSummary from "@/components/interview/InterviewSummary";
import InterviewTimer from "@/components/interview/InterviewTimer";
import CameraMonitor from "@/components/interview/CameraMonitor";
import FaceDetectionModal from "@/components/interview/FaceDetectionModal";
import FaceDetectionWarningModal from "@/components/interview/FaceDetectionWarningModal";
import QuestionNavigation from "@/components/interview/QuestionNavigation";
import InterviewRecorder from "@/components/interview/InterviewRecorder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, Star, ArrowLeft, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useErrorRecovery } from "@/hooks/useErrorRecovery";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getAInterviewDetail, completeInterview, updateUserInterviewStats, saveInterviewProgress } from "@/actions/FirebaseUserApi";
import { InterviewType, InterviewResults } from "@/types/user";
import { interviewFeedbackService } from "@/service/InterviewFeedbackService";
import EnhancedLoading from "@/components/interview/EnhancedLoading";
import { exportToPDF, emailResults, shareResults } from "@/components/interview/FeedbackExport";

// Import types from InterviewContext for Answer type
import { Answer } from '@/context/InterviewContext';

// Feedback data type that matches the EnhancedFeedbackDashboard component expectations
type FeedbackItem = {
  id: string;
  question: string;
  userAnswer: string;
  feedback: string;
  score: number;
  // AI feedback fields
  technicalAccuracy?: number;
  completeness?: number;
  clarity?: number;
  strengths?: string[];
  improvements?: string[];
  keywords?: string[];
};

// Question sets based on interview type and difficulty
const getQuestionsForInterview = (type: string, difficulty: string): InterviewData['questions'] => {
  const questions: Record<string, Record<string, InterviewData['questions']>> = {
    frontend: {
      beginner: [
        {
          id: "q1",
          text: "What is the difference between HTML, CSS, and JavaScript?",
          difficulty: "easy",
        },
        {
          id: "q2",
          text: "Explain what responsive design means and how you would implement it.",
          difficulty: "easy",
        },
        {
          id: "q3",
          text: "What are semantic HTML elements and why are they important?",
          difficulty: "easy",
        },
        {
          id: "q4",
          text: "How would you center a div both horizontally and vertically?",
          difficulty: "easy",
        },
        {
          id: "q5",
          text: "What is the difference between var, let, and const in JavaScript?",
          difficulty: "easy",
        },
      ],
      intermediate: [
        {
          id: "q1",
          text: "Explain the concept of event bubbling and event capturing in JavaScript.",
          difficulty: "medium",
        },
        {
          id: "q2",
          text: "What are React hooks and how do useState and useEffect work?",
          difficulty: "medium",
        },
        {
          id: "q3",
          text: "How would you optimize a web application's performance?",
          difficulty: "medium",
        },
        {
          id: "q4",
          text: "Explain the difference between Promise, async/await, and callbacks.",
          difficulty: "medium",
        },
        {
          id: "q5",
          text: "What is the Virtual DOM and how does it improve performance?",
          difficulty: "medium",
        },
      ],
      advanced: [
        {
          id: "q1",
          text: "Design a frontend architecture for a large-scale e-commerce application.",
          difficulty: "hard",
        },
        {
          id: "q2",
          text: "How would you implement lazy loading and code splitting in a React application?",
          difficulty: "hard",
        },
        {
          id: "q3",
          text: "Explain micro-frontends and when you would use this architecture.",
          difficulty: "hard",
        },
        {
          id: "q4",
          text: "How would you handle state management in a complex application?",
          difficulty: "hard",
        },
        {
          id: "q5",
          text: "Design a real-time collaborative editor like Google Docs.",
          difficulty: "hard",
        },
      ],
    },
    backend: {
      beginner: [
        {
          id: "q1",
          text: "What is the difference between HTTP and HTTPS?",
          difficulty: "easy",
        },
        {
          id: "q2",
          text: "Explain what a REST API is and its key principles.",
          difficulty: "easy",
        },
        {
          id: "q3",
          text: "What is the difference between SQL and NoSQL databases?",
          difficulty: "easy",
        },
        {
          id: "q4",
          text: "What are HTTP status codes and what do they mean?",
          difficulty: "easy",
        },
        {
          id: "q5",
          text: "Explain the concept of authentication vs authorization.",
          difficulty: "easy",
        },
      ],
      intermediate: [
        {
          id: "q1",
          text: "How would you design a caching strategy for a web application?",
          difficulty: "medium",
        },
        {
          id: "q2",
          text: "Explain database indexing and when you would use different types of indexes.",
          difficulty: "medium",
        },
        {
          id: "q3",
          text: "What is the difference between monolithic and microservices architecture?",
          difficulty: "medium",
        },
        {
          id: "q4",
          text: "How would you handle API rate limiting and why is it important?",
          difficulty: "medium",
        },
        {
          id: "q5",
          text: "Explain the CAP theorem and its implications for distributed systems.",
          difficulty: "medium",
        },
      ],
      advanced: [
        {
          id: "q1",
          text: "Design a scalable backend system for a social media platform with millions of users.",
          difficulty: "hard",
        },
        {
          id: "q2",
          text: "How would you implement distributed transactions across multiple services?",
          difficulty: "hard",
        },
        {
          id: "q3",
          text: "Design a real-time messaging system like WhatsApp or Slack.",
          difficulty: "hard",
        },
        {
          id: "q4",
          text: "How would you handle data consistency in a distributed database?",
          difficulty: "hard",
        },
        {
          id: "q5",
          text: "Design a load balancing strategy for high-traffic applications.",
          difficulty: "hard",
        },
      ],
    },
    fullstack: {
      beginner: [
        {
          id: "q1",
          text: "Explain the request-response cycle in a web application.",
          difficulty: "easy",
        },
        {
          id: "q2",
          text: "What is the difference between client-side and server-side rendering?",
          difficulty: "easy",
        },
        {
          id: "q3",
          text: "How does data flow from a database to the user interface?",
          difficulty: "easy",
        },
        {
          id: "q4",
          text: "What are environment variables and why are they important?",
          difficulty: "easy",
        },
        {
          id: "q5",
          text: "Explain the basic structure of a full-stack application.",
          difficulty: "easy",
        },
      ],
      intermediate: [
        {
          id: "q1",
          text: "How would you implement user authentication in a full-stack application?",
          difficulty: "medium",
        },
        {
          id: "q2",
          text: "Explain the difference between session-based and token-based authentication.",
          difficulty: "medium",
        },
        {
          id: "q3",
          text: "How would you handle file uploads in a web application?",
          difficulty: "medium",
        },
        {
          id: "q4",
          text: "What are the considerations for API design and versioning?",
          difficulty: "medium",
        },
        {
          id: "q5",
          text: "How would you implement real-time features in a web application?",
          difficulty: "medium",
        },
      ],
      advanced: [
        {
          id: "q1",
          text: "Design a complete e-commerce platform from frontend to backend to database.",
          difficulty: "hard",
        },
        {
          id: "q2",
          text: "How would you implement a CI/CD pipeline for a full-stack application?",
          difficulty: "hard",
        },
        {
          id: "q3",
          text: "Design a multi-tenant SaaS application architecture.",
          difficulty: "hard",
        },
        {
          id: "q4",
          text: "How would you implement horizontal scaling for both frontend and backend?",
          difficulty: "hard",
        },
        {
          id: "q5",
          text: "Design a real-time analytics dashboard with millions of data points.",
          difficulty: "hard",
        },
      ],
    },
  };

  return questions[type]?.[difficulty] || questions.fullstack.intermediate;
};

// Function to convert Firebase interview data to InterviewData format
const convertFirebaseToInterviewData = (firebaseInterview: InterviewType): InterviewData => {
  // Convert Firebase questions format to InterviewData questions format
  const questions = firebaseInterview.questions?.map((q, index) => ({
    id: q.qid || `q${index + 1}`,
    text: q.question,
    difficulty: "medium" as const, // Default difficulty
  })) || [];

  // If no questions exist, generate default questions
  const finalQuestions = questions.length > 0 ? questions : getQuestionsForInterview(
    firebaseInterview.type || 'fullstack',
    firebaseInterview.difficulty || 'intermediate'
  );

  return {
    id: firebaseInterview.id,
    title: firebaseInterview.title,
    description: firebaseInterview.description || "Practice interview session",
    duration: firebaseInterview.duration || 45,
    questions: finalQuestions,
  };
};

// Enhanced loading component
const InterviewLoadingCard = () => (
  <EnhancedLoading variant="interview" />
);

// Enhanced error component
const InterviewErrorCard = ({ onRetry }: { onRetry: () => void }) => (
  <div className="container max-w-4xl mx-auto py-8 px-4">
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Interview Not Found</CardTitle>
        </div>
        <CardDescription>
          We could not load the interview data. This might be because:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>The interview does not exist or has been deleted</li>
          <li>You do not have permission to access this interview</li>
          <li>There is a temporary network issue</li>
        </ul>
        
        <div className="flex items-center space-x-3">
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
          <Button 
            onClick={() => window.history.back()} 
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Enhanced interview preview component
const InterviewPreviewCard = ({ 
  interviewData, 
  onStartInterview 
}: { 
  interviewData: InterviewData; 
  onStartInterview: () => void;
}) => {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{interviewData.title}</h1>
            <p className="text-muted-foreground mt-1">
              Get ready for your interview session
            </p>
          </div>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </Button>
        </div>

        {/* Main interview card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{interviewData.title}</CardTitle>
                <CardDescription className="mt-1">
                  {interviewData.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                Ready to Start
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Interview stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-xs text-muted-foreground">{interviewData.duration} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border">
                <div className="p-2 bg-green-100 rounded-full">
                  <Star className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Questions</p>
                  <p className="text-xs text-muted-foreground">{interviewData.questions.length} questions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-xs text-muted-foreground">Interactive Session</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">Interview Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make sure you are in a quiet environment</li>
                <li>• Enable your camera and microphone when prompted</li>
                <li>• Answer each question thoughtfully and completely</li>
                <li>• You can navigate between questions during the interview</li>
                <li>• Your progress will be automatically saved</li>
              </ul>
            </div>

            {/* Start button */}
            <Button 
              onClick={onStartInterview} 
              className="w-full h-12 text-lg font-medium"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Generate AI-powered feedback based on interview answers
const generateAIFeedback = async (
  questions: InterviewData['questions'], 
  answers: Answer[], 
  interviewId: string, 
  userId: string, 
  interviewType: string, 
  difficulty: string, 
  timeSpent: number
): Promise<FeedbackItem[]> => {
  try {
    console.log('Generating AI feedback for interview:', interviewId);
    
    const feedbackParams = {
      interviewId,
      userId,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        difficulty: q.difficulty
      })),
      answers,
      interviewType,
      difficulty,
      timeSpent
    };
    
    const results = await interviewFeedbackService.generateFeedback(feedbackParams);
    
    // Convert AnswerAnalysis[] to FeedbackItem[] by mapping questionId to id
    return results.answers.map(analysis => ({
      id: analysis.questionId, // Map questionId to id for FeedbackItem compatibility
      question: analysis.question,
      userAnswer: analysis.userAnswer,
      feedback: analysis.feedback,
      score: analysis.score,
      technicalAccuracy: analysis.technicalAccuracy,
      completeness: analysis.completeness,
      clarity: analysis.clarity,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      keywords: analysis.keywords
    }));
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    // Fallback to basic feedback if AI fails
    return generateFallbackFeedback(questions, answers);
  }
};

// Fallback feedback generation if AI service fails
const generateFallbackFeedback = (questions: InterviewData['questions'], answers: Answer[]): FeedbackItem[] => {
  return questions.map((question) => {
    const userAnswer = answers.find(a => a.questionId === question.id);
    const answerText = userAnswer?.text || "";
    const score = answerText.length > 0 ? Math.floor(Math.random() * 30) + 60 : 0;
    
    return {
      id: question.id, // Use id instead of questionId for FeedbackItem compatibility
      question: question.text,
      userAnswer: answerText,
      score,
      feedback: answerText.length > 0 
        ? "Good answer with room for improvement. Consider adding more specific examples and technical details." 
        : "This question was not answered.",
      strengths: answerText.length > 0 ? [
        "Shows understanding",
        "Addresses the question"
      ] : [],
      improvements: answerText.length > 0 ? [
        "Add more technical depth",
        "Provide specific examples"
      ] : [
        "Review this topic",
        "Practice similar questions"
      ],
      technicalAccuracy: answerText.length > 0 ? score * 0.8 : 0,
      completeness: answerText.length > 0 ? score * 0.9 : 0,
      clarity: answerText.length > 0 ? score * 1.1 : 0,
      keywords: []
    };
  });
};

// Interview Content Component (to be wrapped by InterviewProvider)
function InterviewContent({ firebaseData }: { firebaseData?: InterviewType }): React.JSX.Element {
  const router = useRouter();
  const { 
    interview, 
    currentQuestionIndex, 
    answers, 
    isCompleted,
    startInterview, 
    nextQuestion, 
    previousQuestion, 
    saveAnswer, 
    finishInterview 
  } = useInterview();  
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [showFaceDetectionModal, setShowFaceDetectionModal] = useState(true);
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType] = useState<'warning' | 'violation' | null>(null);  
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStage, setAiStage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Network status monitoring
  const networkStatus = useNetworkStatus({
    onConnectionLost: () => {
      console.log('Connection lost - enabling offline mode');
    },
    onConnectionRestored: () => {
      console.log('Connection restored');
    }
  });

  // Error recovery for API calls
  const errorRecovery = useErrorRecovery({
    maxRetries: 3,
    retryDelay: 2000,
    exponentialBackoff: true,
    onRetry: (attempt) => {
      console.log(`Retrying API call, attempt ${attempt}`);
    }
  });

  // Auto-save progress every 30 seconds and when navigating between questions
  useEffect(() => {
    if (!interview || !firebaseData?.userId || answers.length === 0) return;

    const saveProgress = async () => {
      if (!networkStatus.isOnline) {
        setSaveStatus('error');
        return;
      }

      try {
        setSaveStatus('saving');
        const formattedAnswers = answers.map(answer => ({
          ...answer,
          answeredAt: new Date()
        }));

        await errorRecovery.executeWithRetry(async () => {
          await saveInterviewProgress(
            interview.id,
            firebaseData.userId,
            formattedAnswers,
            currentQuestionIndex
          );
        });
        
        setSaveStatus('saved');
        console.log('Progress saved automatically');
        
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Error saving progress:', error);
        setSaveStatus('error');
        // Clear error status after 5 seconds
        setTimeout(() => setSaveStatus('idle'), 5000);
      }
    };

    // Save progress every 30 seconds
    const interval = setInterval(saveProgress, 30000);    // Save progress when answers or question index changes
    const timeoutId = setTimeout(saveProgress, 2000); // Debounced save

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [answers, currentQuestionIndex, interview, firebaseData?.userId, networkStatus.isOnline, errorRecovery]);

  // Get the completed questions (those with answers)
  const completedQuestionIds = answers.map((a: Answer) => a.questionId);

  // Handle start interview with face detection
  const handleStartWithFaceDetection = () => {
    setIsFaceDetectionActive(true);
    startInterview();
  };

  // Handle exit interview
  const handleExit = () => {
    router.push("/interview");
  };

  // Handle time up
  const handleTimeUp = () => {
    finishInterview();
    setShowFeedback(true);
  };

  // Handle view results
  const handleViewResults = () => {
    setShowFeedback(true);
  };

  // Export handlers
  const handleExportPDF = async () => {
    try {
      const exportData = {
        feedbackItems: feedback,
        overallScore,
        interviewData: {
          title: interview?.title || 'Interview',
          duration: interview?.duration || 45,
          totalQuestions: interview?.questions.length || 0,
          completedAt: new Date()
        }
      };
      await exportToPDF(exportData);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        feedbackItems: feedback,
        overallScore,
        interviewData: {
          title: interview?.title || 'Interview',
          duration: interview?.duration || 45,
          totalQuestions: interview?.questions.length || 0,
          completedAt: new Date()
        }
      };
      await shareResults(shareData);
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  const handleEmailResults = async () => {
    try {
      const emailData = {
        feedbackItems: feedback,
        overallScore,
        interviewData: {
          title: interview?.title || 'Interview',
          duration: interview?.duration || 45,
          totalQuestions: interview?.questions.length || 0,
          completedAt: new Date()
        }
      };
      await emailResults(emailData, 'user@example.com');
    } catch (error) {
      console.error('Error emailing results:', error);
    }
  };

  // Handle save progress
  const handleSave = () => {
    console.log("Saving interview progress...", { answers });
  };

  // Get the current question
  const currentQuestion = interview?.questions[currentQuestionIndex];
  
  // Get the user's answer for the current question
  const currentAnswer = currentQuestion 
    ? answers.find((a: Answer) => a.questionId === currentQuestion.id)?.text || "" 
    : "";

  // Handle answer change
  const handleAnswerChange = (text: string) => {
    if (currentQuestion) {
      saveAnswer(currentQuestion.id, text);
    }
  };

  // Handle question selection from navigation
  const handleQuestionSelect = (index: number) => {
    if (index <= currentQuestionIndex + 1 && 
        (index === currentQuestionIndex || 
         index === currentQuestionIndex + 1 || 
         (interview && completedQuestionIds.includes(interview.questions[index].id)))) {
      if (index < currentQuestionIndex) {
        for (let i = currentQuestionIndex; i > index; i--) {
          previousQuestion();
        }
      } else if (index > currentQuestionIndex) {
        nextQuestion();
      }
    }
  };

  // Handle next question
  const handleNextQuestion = async () => {
    if (interview && currentQuestionIndex === interview.questions.length - 1) {
      try {
        setIsGeneratingFeedback(true);
        setAiProgress(10);
        setAiStage('Preparing interview data...');
        finishInterview();
        
        console.log('Interview completed, generating AI feedback...');
        
        const timeSpent = interview.duration || 45;
        
        setAiProgress(30);
        setAiStage('Analyzing your responses...');
        
        const aiFeedback = await errorRecovery.executeWithRetry(async () => {
          return await generateAIFeedback(
            interview.questions, 
            answers, 
            interview.id, 
            firebaseData?.userId || '', 
            firebaseData?.type || 'fullstack', 
            firebaseData?.difficulty || 'intermediate', 
            timeSpent
          );
        });
        
        setAiProgress(70);
        setAiStage('Generating recommendations...');
        
        const interviewResults: InterviewResults = {
          summary: {
            overallScore: Math.round(aiFeedback.reduce((sum: number, item: FeedbackItem) => sum + (item.score || 0), 0) / aiFeedback.length),
            totalQuestions: interview.questions.length,
            answeredQuestions: answers.length,
            timeSpent: timeSpent,
            averageTimePerQuestion: timeSpent / interview.questions.length,
            performance: aiFeedback.reduce((sum: number, item: FeedbackItem) => sum + (item.score || 0), 0) / aiFeedback.length >= 80 ? 'excellent' : 
                        aiFeedback.reduce((sum: number, item: FeedbackItem) => sum + (item.score || 0), 0) / aiFeedback.length >= 70 ? 'good' : 
                        aiFeedback.reduce((sum: number, item: FeedbackItem) => sum + (item.score || 0), 0) / aiFeedback.length >= 60 ? 'average' : 'poor'
          },
          answers: aiFeedback.map((fb: FeedbackItem) => ({
            questionId: fb.id,
            question: fb.question,
            answer: fb.userAnswer,
            score: fb.score,
            feedback: fb.feedback,
            technicalAccuracy: fb.technicalAccuracy || 0,
            completeness: fb.completeness || 0,
            clarity: fb.clarity || 0,
            strengths: fb.strengths || [],
            improvements: fb.improvements || [],
            keywords: fb.keywords || []
          })),
          skillsAssessment: {
            strengths: aiFeedback.flatMap((fb: FeedbackItem) => fb.strengths || []).slice(0, 5),
            weaknesses: aiFeedback.flatMap((fb: FeedbackItem) => fb.improvements || []).slice(0, 5),
            recommendations: [
              `Focus on ${firebaseData?.type || 'technical'} fundamentals`,
              'Practice coding problems daily',
              'Review system design concepts'
            ]
          },
          generatedAt: new Date()
        };
        
        setAiProgress(90);
        setAiStage('Saving results to database...');
        
        if (firebaseData?.userId) {
          await errorRecovery.executeWithRetry(async () => {
            await Promise.all([
              completeInterview(interview.id, firebaseData.userId, interviewResults),
              updateUserInterviewStats(firebaseData.userId, interviewResults)
            ]);
          });
          console.log('Interview results saved to Firebase');
        }
        
        setAiProgress(100);
        setAiStage('Complete!');
        
        setFeedback(aiFeedback);
        setOverallScore(interviewResults.summary.overallScore);
        setShowFeedback(true);
        console.log('AI feedback generated and saved successfully');
      } catch (error) {
        console.error('Error generating AI feedback:', error);
        const fallbackFeedback = generateFallbackFeedback(interview.questions, answers);
        setFeedback(fallbackFeedback);
        const avgScore = fallbackFeedback.reduce((sum: number, item: FeedbackItem) => sum + item.score, 0) / fallbackFeedback.length;
        setOverallScore(Math.round(avgScore));
        setShowFeedback(true);
      } finally {
        setIsGeneratingFeedback(false);
      }
    } else {
      nextQuestion();
    }
  };

  if (!interview) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Interview not found or failed to load. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show face detection modal at the start
  if (showFaceDetectionModal && !isCompleted) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">{interview.title}</h1>
        <FaceDetectionModal
          isOpen={showFaceDetectionModal}
          onClose={() => setShowFaceDetectionModal(false)}
          onStartInterview={handleStartWithFaceDetection}
        />
      </div>
    );
  }

  // Show feedback/results screen
  if (showFeedback || isGeneratingFeedback) {
    return (
      <InterviewLayout 
        title={interview.title} 
        duration={interview.duration}
      >
        {isGeneratingFeedback ? (
          <EnhancedLoading 
            variant="ai-processing"
            progress={aiProgress}
            stage={aiStage}
            canCancel={false}
          />
        ) : (
          <EnhancedFeedbackDashboard 
            feedbackItems={feedback}
            overallScore={overallScore}
            interviewData={{
              title: interview?.title || 'Interview',
              duration: interview?.duration || 45,
              totalQuestions: interview?.questions.length || 0,
              completedAt: new Date()
            }}
            onExportPDF={handleExportPDF}
            onShare={handleShare}
            onEmailResults={handleEmailResults}
          />
        )}
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleExit}
            disabled={isGeneratingFeedback}
          >
            Return to Interviews
          </Button>
        </div>
      </InterviewLayout>
    );
  }

  // Show completion summary
  if (isCompleted && !showFeedback) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <InterviewSummary
          interviewData={{
            id: interview.id,
            title: interview.title,
            description: interview.description,
            duration: interview.duration,
            questionsCount: interview.questions.length,
            completedAt: new Date(),
            score: overallScore,
          }}
          onViewResults={handleViewResults}
        />
      </div>
    );
  }

  // Main interview interface
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        {/* Enhanced Header */}
        <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleExit}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Interview
                </Button>
                <div className="h-4 w-px bg-border" />
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">{interview.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {interview.questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-xs">
                  {Math.round((completedQuestionIds.length / interview.questions.length) * 100)}% Complete
                </Badge>
                <InterviewTimer 
                  duration={interview.duration} 
                  onTimeUp={handleTimeUp} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left sidebar - Enhanced Question Navigation */}
            <div className="lg:col-span-3">
              <Card className="sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Questions</CardTitle>
                  <CardDescription className="text-xs">
                    Track your progress through the interview
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <QuestionNavigation 
                    questions={interview.questions}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuestionSelect={handleQuestionSelect}
                    completedQuestions={completedQuestionIds}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Center - Enhanced Question Area */}
            <div className="lg:col-span-6">
              {currentQuestion && (
                <div className="space-y-6">
                  {/* Enhanced Question Card */}
                  <Card className="border-2 border-primary/10 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {currentQuestionIndex + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">Interview Question</CardTitle>
                            <CardDescription>
                              Take your time to provide a thoughtful answer
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={currentQuestion.difficulty === 'easy' ? 'secondary' : 
                                  currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {/* Question Text */}
                        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                          <p className="text-base leading-relaxed font-medium">
                            {currentQuestion.text}
                          </p>
                        </div>

                        {/* Answer Input */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-foreground">
                            Your Answer
                          </label>
                          <InterviewQuestion 
                            question={currentQuestion}
                            userAnswer={currentAnswer}
                            onAnswerChange={handleAnswerChange}
                            onNextQuestion={handleNextQuestion}
                            isLastQuestion={currentQuestionIndex === interview.questions.length - 1}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Controls */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <InterviewControls 
                          currentQuestion={currentQuestionIndex + 1}
                          totalQuestions={interview.questions.length}
                          onPrevious={previousQuestion}
                          onNext={handleNextQuestion}
                          onSave={handleSave}
                          onExit={handleExit}
                          canGoNext={!!currentAnswer.trim()}
                          canGoPrevious={currentQuestionIndex > 0}
                          isLastQuestion={currentQuestionIndex === interview.questions.length - 1}
                        />
                        
                        <InterviewRecorder
                          interviewId={interview.id}
                          interviewTitle={interview.title}
                          isActive={isFaceDetectionActive}
                          answers={answers}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            {/* Right sidebar - Enhanced Camera Monitor */}
            <div className="lg:col-span-3">
              <Card className="sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Camera Monitor</CardTitle>
                  <CardDescription className="text-xs">
                    Stay visible throughout the interview
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <CameraMonitor 
                    isActive={isFaceDetectionActive} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Face detection warning/violation modal */}
      <FaceDetectionWarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        timeWithoutFace={0}
        warningCount={0}
        onResume={() => setIsModalOpen(false)}
      />
      
      {/* Status Indicators */}
      {saveStatus === 'saving' && (
        <EnhancedLoading variant="saving" message="Saving progress..." />
      )}
      {saveStatus === 'saved' && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="p-3 border-green-500 bg-green-50">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Progress saved</span>
            </div>
          </Card>
        </div>
      )}
      {!networkStatus.isOnline && (
        <EnhancedLoading variant="network" message="Connection lost. Changes will be saved when reconnected." />
      )}
    </>
  );
}

// Main page component
export default function InterviewPage() {
  const params = useParams();
  const { userData } = useAuth();
  const [firebaseData, setFirebaseData] = useState<InterviewType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Extract interview ID from params
  const interviewId = Array.isArray(params.interviewId) 
    ? params.interviewId[0] 
    : params.interviewId || "";

  // Memoize the converted interview data to prevent unnecessary re-renders
  const interviewData = useMemo(() => {
    return firebaseData ? convertFirebaseToInterviewData(firebaseData) : null;
  }, [firebaseData]);

  // Load interview data when component mounts or dependencies change
  useEffect(() => {
    const loadInterviewData = async () => {
      if (!userData?.uid || !interviewId) {
        setError("Missing authentication or interview ID");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getAInterviewDetail(userData.uid, interviewId);
        if (response.success && response.data) {
          const firebaseInterview = response.data as InterviewType;
          setFirebaseData(firebaseInterview);
        } else {
          setError("Failed to load interview");
        }
      } catch (err) {
        console.error("Error loading interview:", err);
        setError("Failed to load interview data");
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.uid && interviewId) {
      loadInterviewData();
    }
  }, [userData?.uid, interviewId]);

  // Show loading state
  if (isLoading || !interviewData) {
    return <InterviewLoadingCard />;
  }

  // Show error state
  if (error || !interviewData) {
    const retryLoadData = () => {
      if (userData?.uid && interviewId) {
        setIsLoading(true);
        setError(null);
        
        getAInterviewDetail(userData.uid, interviewId)
          .then(response => {
            if (response.success && response.data) {
              const firebaseInterview = response.data as InterviewType;
              setFirebaseData(firebaseInterview);
            } else {
              setError("Failed to load interview");
            }
          })
          .catch(err => {
            console.error("Error loading interview:", err);
            setError("Failed to load interview data");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    };

    return (
      <InterviewErrorCard 
        onRetry={retryLoadData}
      />
    );
  }

  // Show interview preview before starting
  if (showPreview) {
    return (
      <InterviewPreviewCard 
        interviewData={interviewData}
        onStartInterview={() => setShowPreview(false)}
      />
    );
  }

  // Create a wrapper component to initialize the interview data in the context
  const InterviewWrapper = () => {
    const { setInterview, interview: contextInterview } = useInterview();
    
    // Set the interview data in the context when the component mounts
    useEffect(() => {
      if (interviewData && (!contextInterview || contextInterview.id !== interviewData.id)) {
        console.log("Setting interview data in context:", interviewData.id);
        setInterview(interviewData);
      }
    }, [setInterview, contextInterview]);

    return <InterviewContent firebaseData={firebaseData || undefined} />;
  };

  return (
    <InterviewProvider>
      <InterviewWrapper />
    </InterviewProvider>
  );
}
