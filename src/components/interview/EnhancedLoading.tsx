import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface EnhancedLoadingProps {
  variant?: 'interview' | 'ai-processing' | 'saving' | 'network';
  progress?: number;
  stage?: string;
  message?: string;
  canCancel?: boolean;
  onCancel?: () => void;
}

const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  variant = 'interview',
  progress = 0,
  stage = '',
  message = '',
  canCancel = false,
  onCancel
}) => {
  const renderInterviewLoading = () => (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        {/* Interview Info Card */}
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading interview details...
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIProcessing = () => (
    <div className="space-y-6">
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-primary/20 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Generating AI Feedback</h3>
            <p className="text-sm text-muted-foreground">
              {stage || 'Analyzing your interview responses...'}
            </p>
          </div>
          
          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Analyzing technical accuracy</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {progress > 30 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span>Evaluating completeness</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {progress > 60 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 border-2 border-gray-200 rounded-full" />
              )}
              <span>Generating recommendations</span>
            </div>
          </div>
          
          {canCancel && (
            <button 
              onClick={onCancel}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </Card>
    </div>
  );

  const renderSaving = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-3">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>{message || 'Saving progress...'}</span>
        </div>
      </Card>
    </div>
  );

  const renderNetworkError = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-3 border-destructive bg-destructive/5">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{message || 'Connection lost. Retrying...'}</span>
        </div>
      </Card>
    </div>
  );

  switch (variant) {
    case 'interview':
      return renderInterviewLoading();
    case 'ai-processing':
      return renderAIProcessing();
    case 'saving':
      return renderSaving();
    case 'network':
      return renderNetworkError();
    default:
      return renderInterviewLoading();
  }
};

export default EnhancedLoading;
