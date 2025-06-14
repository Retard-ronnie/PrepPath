import React from 'react';
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  duration?: number; // estimated duration in seconds
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: string;
  progress?: number;
  showTimeEstimate?: boolean;
  compact?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  progress = 0,
  showTimeEstimate = true,
  compact = false
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  const getTimeEstimate = () => {
    const remainingSteps = steps.slice(currentStepIndex);
    const totalEstimatedTime = remainingSteps.reduce((acc, step) => acc + (step.duration || 0), 0);
    return totalEstimatedTime;
  };

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <div className="h-4 w-4 border-2 border-gray-200 rounded-full" />;
    }
  };

  const getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'in-progress':
        return 'text-primary';
      default:
        return 'text-gray-400';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          {showTimeEstimate && (
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{getTimeEstimate()}s remaining
            </span>
          )}
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {steps[currentStepIndex]?.label}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Progress</h3>
          {showTimeEstimate && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~{getTimeEstimate()}s remaining
            </span>
          )}
        </div>
        <Progress value={overallProgress} className="h-3" />
        <div className="text-sm text-muted-foreground">
          {completedSteps} of {totalSteps} steps completed
        </div>
      </div>

      {/* Detailed Steps */}
      <div className="space-y-3">        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
              step.status === 'in-progress' 
                ? 'bg-primary/5 border border-primary/20' 
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStepIcon(step)}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${getStepColor(step)}`}>
                {step.label}
              </div>
              {step.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </div>
              )}
              {step.status === 'in-progress' && progress > 0 && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(progress)}% complete
                  </div>
                </div>
              )}
            </div>
            {step.duration && (
              <div className="text-xs text-muted-foreground">
                ~{step.duration}s
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
