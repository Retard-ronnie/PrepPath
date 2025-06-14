import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';

interface InterviewSummaryProps {
  interviewData: {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    questionsCount: number;
    completedAt?: Date;
    score?: number;
  };
  onStartInterview?: () => void;
  onViewResults?: () => void;
}

const InterviewSummary: React.FC<InterviewSummaryProps> = ({
  interviewData,
  onStartInterview,
  onViewResults,
}) => {
  const isCompleted = !!interviewData.completedAt;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{interviewData.title}</CardTitle>
            <CardDescription className="mt-2">{interviewData.description}</CardDescription>
          </div>
          {isCompleted && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{interviewData.duration} minutes</span>
            <span className="mx-2">•</span>
            <span>{interviewData.questionsCount} questions</span>
          </div>
          
          {isCompleted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Score</span>
                <span className="text-lg font-bold">{interviewData.score}%</span>
              </div>
              <Button 
                onClick={onViewResults} 
                variant="outline" 
                className="w-full"
              >
                View Detailed Results
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onStartInterview} 
              className="w-full"
            >
              Start Interview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewSummary;
