"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Brain, 
  Calendar, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Eye,
  ChevronRight,
  Target
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAllUserInterview } from "@/actions/FirebaseUserApi";
import { InterviewType } from "@/types/user";

const CompletedInterviewsComponent = () => {
  const router = useRouter();
  const { userData } = useAuth();
  const [interviews, setInterviews] = useState<InterviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedInterviews = async () => {
      if (!userData?.uid) return;

      try {
        setLoading(true);
        const response = await getAllUserInterview(userData.uid, 50);
        
        if (response.success && response.data) {
          // Filter only completed interviews
          const completed = response.data.filter((interview: InterviewType) => 
            interview.status === 'completed' && interview.completedAt
          );
          
          // Sort by completion date (newest first)
          completed.sort((a, b) => {
            const dateA = new Date(a.completedAt!).getTime();
            const dateB = new Date(b.completedAt!).getTime();
            return dateB - dateA;
          });
          
          setInterviews(completed);
        } else {
          setError("Failed to load interviews");
        }
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("An error occurred while loading interviews");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedInterviews();
  }, [userData?.uid]);  const formatDate = (date: string | number | Date) => {
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
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Invalid date";
    }
  };
  const formatTime = (date: string | number | Date) => {
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
        return "Invalid time";
      }
      
      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      console.error("Error formatting time:", error, date);
      return "Invalid time";
    }
  };
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return "bg-green-100 text-green-800";
      case 'medium':
      case 'intermediate':
        return "bg-blue-100 text-blue-800";
      case 'hard':
      case 'advanced':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Interviews</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Completed Interviews</h3>
          <p className="text-muted-foreground text-center mb-4">
            Complete your first interview to see detailed results and AI feedback here.
          </p>
          <Button onClick={() => router.push("/interview")}>
            Start Your First Interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Completed Interviews</h2>
          <p className="text-muted-foreground">
            Click on any interview to view detailed results and AI feedback
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {interviews.length} Completed
        </Badge>
      </div>

      <div className="grid gap-4">
        {interviews.map((interview) => {
          const overallScore = interview.score || interview.results?.summary?.overallScore || 0;
          const hasDetailedResults = !!interview.results;
          
          return (
            <Card 
              key={interview.id} 
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary"
              onClick={() => router.push(`/dashboard/interview/${interview.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {interview.title}
                        </h3>
                        {interview.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {interview.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {overallScore > 0 && (
                          <Badge className={getScoreBadgeColor(overallScore)}>
                            {Math.round(overallScore)}%
                          </Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(interview.completedAt!)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(interview.completedAt!)}
                      </div>
                      {interview.duration && (
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {interview.duration} min
                        </div>
                      )}
                      {interview.questions && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          {interview.questions.length} questions
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(interview.difficulty || "medium")}>
                          {interview.difficulty || "Medium"}
                        </Badge>
                        <Badge variant="outline">
                          {interview.type || "General"}
                        </Badge>
                        {interview.company && (
                          <Badge variant="outline">
                            {interview.company}
                          </Badge>
                        )}
                      </div>
                      
                      {hasDetailedResults && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Analysis Available
                        </Badge>
                      )}
                    </div>                    {/* Quick Performance Overview */}
                    {interview.results?.summary && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Performance Snapshot
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Overall Score</p>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={interview.results.summary.overallScore || 0} 
                                className="h-2 flex-1" 
                              />
                              <span className="text-xs font-medium">
                                {Math.round(interview.results.summary.overallScore || 0)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Completion Rate</p>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(interview.results.summary.answeredQuestions / interview.results.summary.totalQuestions) * 100} 
                                className="h-2 flex-1" 
                              />
                              <span className="text-xs font-medium">
                                {interview.results.summary.answeredQuestions}/{interview.results.summary.totalQuestions}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Performance Level</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {interview.results.summary.performance || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="text-center pt-4">
        <Button variant="outline" onClick={() => router.push("/interview")}>
          <Eye className="h-4 w-4 mr-2" />
          View All Interviews
        </Button>
      </div>
    </div>
  );
};

export default CompletedInterviewsComponent;
