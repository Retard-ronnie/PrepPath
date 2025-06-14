"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, Target, TrendingUp, Brain, Award, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAInterviewDetail } from "@/actions/FirebaseUserApi";
import { InterviewType } from "@/types/user";
import EnhancedFeedbackDashboard from "@/components/interview/EnhancedFeedbackDashboard";

const InterviewResultsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  const [interview, setInterview] = useState<InterviewType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!userData?.uid || !id) return;

      try {
        setLoading(true);
        const response = await getAInterviewDetail(userData.uid, id as string);
          if (response.success && response.data) {
          setInterview(response.data as InterviewType);
        } else {
          setError("Failed to load interview data");
        }
      } catch (err) {
        console.error("Error fetching interview:", err);
        setError("An error occurred while loading the interview");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [userData?.uid, id]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Interview
            </CardTitle>
            <CardDescription>{error || "Interview not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const formatDate = (date: string | number | Date) => {
    try {
      // Handle different date formats that might come from Firebase
      let dateObj: Date;
        if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'object' && date !== null && 'seconds' in date) {
        // Firebase Timestamp object
        dateObj = new Date((date as { seconds: number }).seconds * 1000);
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Invalid date";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      scheduled: { color: "bg-blue-100 text-blue-800", label: "Scheduled" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
      expired: { color: "bg-red-100 text-red-800", label: "Expired" },
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Calculate overall metrics
  const overallScore = interview.score || interview.results?.summary?.overallScore || 0;
  const questionsAnswered = interview.questions?.length || 0;
  const duration = interview.duration || 0;

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{interview.title}</h1>
            <p className="text-muted-foreground">Interview Results & Analysis</p>
          </div>
        </div>
        {getStatusBadge(interview.status || "completed")}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {Math.round(overallScore)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{questionsAnswered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{duration}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-sm font-medium">
                  {interview.completedAt ? formatDate(interview.completedAt) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Interview Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="font-medium">{interview.type || "General"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
              <Badge variant="outline">
                {interview.difficulty || "Medium"}
              </Badge>
            </div>
            {interview.company && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="font-medium">{interview.company}</p>
              </div>
            )}
            {interview.position && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Position</p>
                <p className="font-medium">{interview.position}</p>
              </div>
            )}
            {interview.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{interview.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>          <CardContent>
            {interview.results?.summary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Performance</p>
                    <div className="flex items-center gap-2">
                      <Progress value={interview.results.summary.overallScore || 0} className="flex-1" />
                      <span className="text-sm font-medium">
                        {Math.round(interview.results.summary.overallScore || 0)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(interview.results.summary.answeredQuestions / interview.results.summary.totalQuestions) * 100} 
                        className="flex-1" 
                      />
                      <span className="text-sm font-medium">
                        {interview.results.summary.answeredQuestions}/{interview.results.summary.totalQuestions}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Efficiency</p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min((interview.results.summary.averageTimePerQuestion / 5) * 100, 100)} 
                        className="flex-1" 
                      />
                      <span className="text-sm font-medium">
                        {Math.round(interview.results.summary.averageTimePerQuestion)}min/Q
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Performance Level</p>
                    <Badge variant="outline" className="w-fit">
                      {interview.results.summary.performance}
                    </Badge>
                  </div>
                </div>

                {/* Key Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-1">
                      {interview.results.skillsAssessment?.strengths?.slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {interview.results.skillsAssessment?.weaknesses?.slice(0, 3).map((improvement, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ArrowLeft className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0 rotate-90" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No detailed analysis available for this interview.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Feedback Dashboard */}
      {interview.results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Detailed AI Analysis & Feedback
            </CardTitle>
            <CardDescription>
              Comprehensive breakdown of your interview performance with AI-powered insights
            </CardDescription>
          </CardHeader>          <CardContent>
            <EnhancedFeedbackDashboard 
              feedbackItems={interview.results.answers.map(answer => ({
                id: answer.questionId,
                question: answer.question,
                userAnswer: answer.answer,
                feedback: answer.feedback,
                score: answer.score,
                technicalAccuracy: answer.technicalAccuracy,
                completeness: answer.completeness,
                clarity: answer.clarity,
                strengths: answer.strengths,
                improvements: answer.improvements,
                keywords: answer.keywords
              }))}
              overallScore={interview.results.summary.overallScore}              interviewData={{
                title: interview.title,
                duration: interview.duration || 45,
                totalQuestions: interview.results.summary.totalQuestions,
                completedAt: interview.completedAt ? new Date(interview.completedAt) : new Date(interview.results.generatedAt || Date.now())
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Questions and Answers */}
      {interview.questions && interview.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Responses</CardTitle>
            <CardDescription>
              Review all questions asked during the interview and your responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">            {interview.questions.map((question, index) => {
              const answer = interview.answers?.find(a => a.questionId === question.qid);
              const feedback = interview.results?.answers?.find(q => q.questionId === question.qid);
              
              return (
                <div key={question.qid || index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">Question {index + 1}</h4>
                      <p className="text-muted-foreground mt-1">{question.question}</p>
                    </div>
                    {feedback?.score && (
                      <Badge className={`${feedback.score >= 80 ? 'bg-green-100 text-green-800' : 
                        feedback.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {Math.round(feedback.score)}%
                      </Badge>
                    )}
                  </div>
                  
                  {answer && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Your Response:</p>
                      <p className="text-sm">{answer.text}</p>
                    </div>
                  )}
                  
                  {feedback && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {feedback.strengths && feedback.strengths.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-2">Strengths:</p>
                          <ul className="space-y-1">
                            {feedback.strengths.map((strength, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {feedback.improvements && feedback.improvements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-orange-700 mb-2">Improvements:</p>
                          <ul className="space-y-1">
                            {feedback.improvements.map((improvement, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                <TrendingUp className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewResultsPage;
