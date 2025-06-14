"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, Target, Lightbulb, Star, ChevronRight, Loader2 } from "lucide-react";
import { geminiService, type ProfileSummary, type InterviewSuggestion, type InterviewData } from "@/service/GeminiService";
import { createInterviewFromSuggestion } from "@/utils/interviewUtils";
import { useAuth } from "@/hooks/useAuth";
import { createInterview, getAllUserInterview } from "@/actions/FirebaseUserApi";

interface ProfileInsightsProps {
  className?: string;
}

const ProfileInsights: React.FC<ProfileInsightsProps> = ({ className }) => {
    const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [suggestions, setSuggestions] = useState<InterviewSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingInterviews, setCreatingInterviews] = useState<Set<number>>(new Set());
  const router = useRouter();
  const {userData} = useAuth()

  const handleCreateInterview = async (suggestion: InterviewSuggestion, index: number) => {
  
    try {
      setCreatingInterviews(prev => new Set(prev).add(index));
      
      // Create the interview object
      const newInterview = createInterviewFromSuggestion(suggestion);
      
      if (userData?.uid) {
        // Save the interview to Firebase instead of localStorage
        const response = await createInterview(userData.uid, newInterview.id, newInterview);
        
        if (response.success) {
          // Navigate to the newly created interview after a short delay
          setTimeout(() => {
            router.push(`/interview/${newInterview.id}`);
          }, 500);
        } else {
          throw new Error(response.error?.message || "Failed to create interview");
        }
      } else {
        throw new Error("User not authenticated");
      }

    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to create interview. Please try again.');
    } finally {
      setCreatingInterviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const generateInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!userData || !userData.uid) {
          setError('Please log in to see personalized insights.');
          setIsLoading(false);
          return;
        }

        // Get user's interview data from Firebase instead of localStorage
        let userInterviews: InterviewData[] = [];
        let completedInterviews = 0;
        let averageScore = 0;
        
        try {
          const response = await getAllUserInterview(userData.uid, 10);
          
          if (response.success && response.data) {
            userInterviews = response.data as unknown as InterviewData[];
            
            // Count completed interviews and calculate average score
            const completed = userInterviews.filter(interview => 
              interview.status === 'completed' || interview.completedAt
            );
            
            completedInterviews = completed.length;
            
            // Calculate average score if there are completed interviews with scores
            const interviewsWithScores = completed.filter(interview => interview.score !== undefined);
            if (interviewsWithScores.length > 0) {
              const totalScore = interviewsWithScores.reduce((sum, interview) => sum + (interview.score || 0), 0);
              averageScore = totalScore / interviewsWithScores.length;
            }
          }
        } catch (fetchError) {
          console.error('Error fetching interviews:', fetchError);
        }

        const userProfile = {
          interviews: userInterviews.slice(0, 5), // Last 5 interviews
          answers: [], // Placeholder for answers data
          completedInterviews,
          averageScore,
          preferredTopics: userData?.bio || '',
          experience: userData?.education?.map(edu => `${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}`).join(', ') || ''
        };

        // Generate profile summary
        try {
          const summary = await geminiService.generateProfileSummary(userProfile);
          setProfileSummary(summary);
  
          // Generate interview suggestions
          const suggestionProfile = {
            skillLevel: summary.skillLevel,
            weakAreas: summary.areasForImprovement,
            preferredTopics: userData?.bio ? [userData.bio] : [],
            recentInterviews: userInterviews.slice(0, 3)
          };
          
          const interviewSuggestions = await geminiService.generateInterviewSuggestions(suggestionProfile);
          setSuggestions(interviewSuggestions);
        } catch (aiError) {
          console.error('AI service error:', aiError);
          setError('Failed to generate AI insights. Please try again later.');
        }

      } catch (err) {
        console.error('Error generating insights:', err);
        setError('Failed to generate insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();
  }, [userData]);

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 border-green-200",
    intermediate: "bg-blue-100 text-blue-800 border-blue-200", 
    advanced: "bg-red-100 text-red-800 border-red-200"
  };

  const skillLevelColors = {
    beginner: "text-green-600",
    intermediate: "text-blue-600",
    advanced: "text-purple-600"
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>AI Profile Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>AI Profile Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Summary */}
      {profileSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI Profile Insights</CardTitle>
              </div>
              <Badge variant="outline" className={skillLevelColors[profileSummary.skillLevel]}>
                {profileSummary.skillLevel} Level
              </Badge>
            </div>
            <CardDescription>
              {profileSummary.summary}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strengths */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-600">Strengths</h4>
                </div>
                <ul className="space-y-1 text-sm">
                  {profileSummary.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-orange-600">Focus Areas</h4>
                </div>
                <ul className="space-y-1 text-sm">
                  {profileSummary.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-orange-500 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-600">Recommendations</h4>
                </div>
                <ul className="space-y-1 text-sm">
                  {profileSummary.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Interviews */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <CardTitle>Suggested Interviews</CardTitle>
            </div>
            <CardDescription>
              Personalized interview recommendations based on your profile and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <Badge variant="outline" className={difficultyColors[suggestion.difficulty]}>
                        {suggestion.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {suggestion.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {suggestion.focus.map((topic, topicIndex) => (
                          <Badge key={topicIndex} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>{suggestion.type} • {suggestion.estimatedDuration}min</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        variant="outline" 
                        onClick={() => handleCreateInterview(suggestion, index)}
                        disabled={creatingInterviews.has(index)}
                      >
                        {creatingInterviews.has(index) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Interview'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileInsights;
