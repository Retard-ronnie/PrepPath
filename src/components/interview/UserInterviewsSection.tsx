"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Plus } from "lucide-react";
import UserInterviewCard from "./UserInterviewCard";
import { useRouter } from "next/navigation";

interface UserInterview {
  id: string;
  title: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  field: "it" | "cs" | "other";
  type: "frontend" | "backend" | "fullstack" | "devops" | "other";
  date: string;
  createdAt: string;
}

const UserInterviewsSection: React.FC = () => {
  const [interviews, setInterviews] = useState<UserInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadInterviews = () => {
      try {
        const storedInterviews = localStorage.getItem("interviews");
        if (storedInterviews) {
          const parsedInterviews = JSON.parse(storedInterviews);
          // Sort by creation date (newest first) and take first 3
          const sortedInterviews = parsedInterviews
            .sort((a: UserInterview, b: UserInterview) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 3);
          setInterviews(sortedInterviews);
        }
      } catch (error) {
        console.error("Error loading interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviews();
  }, []);

  const handleCreateInterview = () => {
    router.push("/interview/create");
  };

  const handleViewAllInterviews = () => {
    router.push("/interview");
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Your Interviews</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (interviews.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Your Interviews</h2>
          <Button variant="ghost" className="gap-1" onClick={handleCreateInterview}>
            Create interview <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
          <CardHeader className="text-center py-12">
            <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>No interviews created yet</CardTitle>
            <CardDescription>
              Create your first custom interview to get started with personalized practice sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-12">
            <Button onClick={handleCreateInterview} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Interview
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Interviews</h2>
        <div className="flex gap-2">
          <Button variant="ghost" className="gap-1" onClick={handleViewAllInterviews}>
            View all <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-1" onClick={handleCreateInterview}>
            <Plus className="h-4 w-4" />
            Create new
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviews.map((interview) => (
          <UserInterviewCard key={interview.id} interview={interview} />
        ))}
      </div>
      
      {interviews.length >= 3 && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={handleViewAllInterviews} className="gap-1">
            View all {interviews.length > 3 ? `${interviews.length - 3} more` : ''} interviews
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
};

export default UserInterviewsSection;
