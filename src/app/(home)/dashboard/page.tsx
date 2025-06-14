"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import ProfileInsights from "@/components/interview/ProfileInsights"
import CompletedInterviews from "@/components/interview/CompletedInterviews"
import LearningRoadmapComponent from "@/components/learning/LearningRoadmap"
import { useAuth } from "@/hooks/useAuth"
import { getAllUserInterview } from "@/actions/FirebaseUserApi"
import { InterviewType } from "@/types/user"

interface DashboardStats {
  completedInterviews: number;
  scheduledInterviews: number;
  totalInterviews: number;
  averageScore: number;
}

// Fetch dashboard data from Firebase
const fetchDashboardData = async (userId: string): Promise<DashboardStats> => {
  try {
    const response = await getAllUserInterview<InterviewType>(userId, 100); // Get all interviews
    
    if (!response.success || !response.data) {
      return {
        completedInterviews: 0,
        scheduledInterviews: 0,
        totalInterviews: 0,
        averageScore: 0
      };
    }

    const interviews = response.data;
    const completedInterviews = interviews.filter((interview: InterviewType) => 
      interview.status === 'completed' && interview.completedAt
    );
    
    const scheduledInterviews = interviews.filter((interview: InterviewType) => 
      interview.status === 'scheduled' || (interview.status !== 'completed' && !interview.completedAt)
    );

    // Calculate average score from completed interviews
    const totalScore = completedInterviews.reduce((sum: number, interview: InterviewType) => {
      if (interview.score) {
        return sum + interview.score;
      }
      // If no score but has results, use overall score from results
      if (interview.results?.summary?.overallScore) {
        return sum + interview.results.summary.overallScore;
      }
      return sum;
    }, 0);

    const averageScore = completedInterviews.length > 0 ? 
      Math.round(totalScore / completedInterviews.length) : 0;

    return {
      completedInterviews: completedInterviews.length,
      scheduledInterviews: scheduledInterviews.length,
      totalInterviews: interviews.length,
      averageScore
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      completedInterviews: 0,
      scheduledInterviews: 0,
      totalInterviews: 0,
      averageScore: 0
    };
  }
};

export default function DashboardPage() {
  const { userData, loading: authLoading } = useAuth();
  
  // Interview statistics for dashboard widgets
  const [stats, setStats] = useState<DashboardStats>({
    completedInterviews: 0,
    scheduledInterviews: 0,
    totalInterviews: 0,
    averageScore: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  // Fetch data when user is authenticated
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userData?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchDashboardData(userData.uid);
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && userData?.uid) {
      loadDashboardData();
    }
  }, [userData?.uid, authLoading]);
  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed Interviews</CardDescription>
                <CardTitle className="text-4xl">{stats.completedInterviews}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {stats.completedInterviews === 0 ? "Start your first interview!" : "Great progress!"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Scheduled</CardDescription>
                <CardTitle className="text-4xl">{stats.scheduledInterviews}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {stats.scheduledInterviews === 0 ? "Schedule your next practice" : "Ready to practice"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Interviews</CardDescription>
                <CardTitle className="text-4xl">{stats.totalInterviews}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  All time practice sessions
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Score</CardDescription>
                <CardTitle className="text-4xl">
                  {stats.averageScore > 0 ? `${stats.averageScore}%` : "N/A"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {stats.averageScore === 0 ? 'Complete interviews to see score' :
                   stats.averageScore >= 80 ? 'Excellent!' : 
                   stats.averageScore >= 60 ? 'Good work!' : 'Keep practicing!'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}        {/* AI Profile Insights Section */}
        <div className="mb-10">
          <ProfileInsights />
        </div>        {/* Learning Roadmap Section */}
        <div className="mb-10">
          <LearningRoadmapComponent />
        </div>

        {/* Completed Interviews Section - Only show if user has completed interviews */}
        {stats.completedInterviews > 0 && (
          <div className="mb-10">
            <CompletedInterviews />
          </div>
        )}
        
        <h2 className="text-2xl font-bold mb-6">Recommended Practice Areas</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-2 bg-muted rounded animate-pulse mb-4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : stats.totalInterviews === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-muted-foreground">Start Your Interview Journey</h3>
              <p className="text-sm text-muted-foreground">
                Complete your first interview to get personalized recommendations
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/interview'}
              className="mt-4"
            >
              Create Your First Interview
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
                <CardDescription>Data Structures & Algorithms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(65 + (stats.completedInterviews * 5), 100)}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {stats.completedInterviews > 0 ? 'Making progress' : 'Ready to start'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = '/interview'}
                >
                  Practice Now
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Design</CardTitle>
                <CardDescription>Scalable Architecture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(40 + (stats.completedInterviews * 3), 90)}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {stats.averageScore >= 70 ? 'Good foundation' : 'Room for improvement'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = '/interview'}
                >
                  Practice Now
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Questions</CardTitle>
                <CardDescription>Communication & Leadership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(75 + (stats.completedInterviews * 2), 95)}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {stats.completedInterviews >= 3 ? 'Well practiced' : 'Building confidence'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = '/interview'}
                >
                  Practice Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
