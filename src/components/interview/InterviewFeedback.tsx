import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackItemProps {
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
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({
  question,
  userAnswer,
  feedback,
  score,
  technicalAccuracy,
  completeness,
  clarity,
  strengths,
  improvements,
  keywords,
}) => (
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <h4 className="font-medium text-lg">{question}</h4>
      <div className="flex items-center gap-2">
        <Progress value={score} className="h-2 w-24" />
        <span className="text-sm font-medium">{score}%</span>
        <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
          {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement"}
        </Badge>
      </div>
    </div>

    {/* AI Performance Breakdown */}
    {(technicalAccuracy !== undefined || completeness !== undefined || clarity !== undefined) && (
      <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
        {technicalAccuracy !== undefined && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Technical</div>
            <div className="flex items-center justify-center gap-1">
              <Progress value={technicalAccuracy} className="h-1 w-12" />
              <span className="text-xs font-medium">{Math.round(technicalAccuracy)}%</span>
            </div>
          </div>
        )}
        {completeness !== undefined && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Complete</div>
            <div className="flex items-center justify-center gap-1">
              <Progress value={completeness} className="h-1 w-12" />
              <span className="text-xs font-medium">{Math.round(completeness)}%</span>
            </div>
          </div>
        )}
        {clarity !== undefined && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Clarity</div>
            <div className="flex items-center justify-center gap-1">
              <Progress value={clarity} className="h-1 w-12" />
              <span className="text-xs font-medium">{Math.round(clarity)}%</span>
            </div>
          </div>
        )}
      </div>
    )}
    
    <div className="pl-4 border-l-2 border-muted space-y-3">
      <div>
        <div className="text-sm text-muted-foreground mb-2">Your answer:</div>
        <div className="text-sm mb-3 p-2 bg-background rounded border">{userAnswer}</div>
      </div>
      
      <div>
        <div className="text-sm text-muted-foreground mb-2">AI Feedback:</div>
        <div className="text-sm mb-3">{feedback}</div>
      </div>

      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            Strengths:
          </div>
          <ul className="text-sm space-y-1">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <AlertCircle className="h-3 w-3 text-amber-600" />
            Areas for Improvement:
          </div>
          <ul className="text-sm space-y-1">
            {improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div>
          <div className="text-sm text-muted-foreground mb-2">Key Concepts:</div>
          <div className="flex flex-wrap gap-1">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

interface InterviewFeedbackProps {
  feedbackItems: Array<{
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
  }>;
  overallScore: number;
}

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({
  feedbackItems,
  overallScore,
}) => {
  // Calculate average scores for AI metrics
  const answeredQuestions = feedbackItems.filter(item => item.score > 0).length;
  const avgTechnical = feedbackItems.reduce((sum, item) => sum + (item.technicalAccuracy || 0), 0) / feedbackItems.length;
  const avgCompleteness = feedbackItems.reduce((sum, item) => sum + (item.completeness || 0), 0) / feedbackItems.length;
  const avgClarity = feedbackItems.reduce((sum, item) => sum + (item.clarity || 0), 0) / feedbackItems.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Interview Feedback</CardTitle>
        <div className="flex items-center mt-2">
          <Progress value={overallScore} className="h-2 flex-1 mr-4" />
          <span className="font-bold text-lg">{overallScore}%</span>
        </div>
        
        {/* Overall Performance Breakdown */}
        <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Questions Answered</div>
            <div className="text-lg font-semibold">{answeredQuestions}/{feedbackItems.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Technical Accuracy</div>
            <div className="text-lg font-semibold">{Math.round(avgTechnical)}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Completeness</div>
            <div className="text-lg font-semibold">{Math.round(avgCompleteness)}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Clarity</div>
            <div className="text-lg font-semibold">{Math.round(avgClarity)}%</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {feedbackItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <FeedbackItem
                question={item.question}
                userAnswer={item.userAnswer}
                feedback={item.feedback}
                score={item.score}
                technicalAccuracy={item.technicalAccuracy}
                completeness={item.completeness}
                clarity={item.clarity}
                strengths={item.strengths}
                improvements={item.improvements}
                keywords={item.keywords}
              />
              {index < feedbackItems.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewFeedback;
