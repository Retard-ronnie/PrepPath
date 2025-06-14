import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface InterviewQuestionProps {
  question: {
    id: string;
    text: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

const InterviewQuestion: React.FC<InterviewQuestionProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  onNextQuestion,
  isLastQuestion,
}) => {
  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Question</CardTitle>
          <span className={`px-3 py-1 rounded-full text-sm ${
            question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
        </div>
        <CardDescription className="text-lg font-medium">
          {question.text}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Type your answer here..."
            className="min-h-[150px] w-full"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={onNextQuestion}>
              {isLastQuestion ? 'Finish Interview' : 'Next Question'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewQuestion;
