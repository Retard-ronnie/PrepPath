import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, BarChart, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface InterviewCardProps {
  interview: {
    id: string;
    title: string;
    description: string;
    category: string;
    duration: number; // in minutes
    questionsCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    scheduledFor?: string;
    completedAt?: string;
    score?: number;
  };
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview }) => {
  const isCompleted = !!interview.completedAt;
  const isScheduled = !!interview.scheduledFor;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <Badge className="mb-2">{interview.category}</Badge>
            <CardTitle className="text-xl">{interview.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">{interview.description}</CardDescription>
          </div>
          <Badge variant={
            interview.difficulty === 'easy' ? 'outline' :
            interview.difficulty === 'medium' ? 'secondary' :
            'destructive'
          }>
            {interview.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <span>{interview.duration} minutes</span>
          <span className="mx-2">•</span>
          <span>{interview.questionsCount} questions</span>
        </div>
        
        {isScheduled && !isCompleted && (
          <div className="flex items-center mt-4 text-sm">
            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
            <span>Scheduled for {interview.scheduledFor}</span>
          </div>
        )}
        
        {isCompleted && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Completed</span>
            </div>
            <div className="flex items-center">
              <BarChart className="mr-1 h-4 w-4 text-purple-500" />
              <span className="font-bold">{interview.score}%</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        {isCompleted ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" asChild>
              <Link href={`/interview/${interview.id}/review`}>Review</Link>
            </Button>
            <Button asChild>
              <Link href={`/interview/${interview.id}/retry`}>Retry</Link>
            </Button>
          </div>
        ) : (
          <Button className="w-full" asChild>
            <Link href={`/interview/${interview.id}`}>
              {isScheduled ? 'View Details' : 'Start Interview'}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
