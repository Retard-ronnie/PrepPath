import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  XCircle
} from 'lucide-react';

interface InterviewControlsProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onExit: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSave,
  onExit,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full border-t pt-4 mt-4">
      <div className="flex items-center mb-4 sm:mb-0">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestion} of {totalQuestions}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onSave} 
          className="gap-1"
        >
          <Save className="h-4 w-4" />
          Save Progress
        </Button>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onPrevious} 
            disabled={!canGoPrevious}
            className="px-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>

          {isLastQuestion ? (
            <Button 
              onClick={onNext} 
              disabled={!canGoNext}
              className="gap-1"
            >
              Finish
            </Button>
          ) : (
            <Button 
              onClick={onNext} 
              disabled={!canGoNext}
              className="px-3"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          )}
        </div>

        <Button 
          variant="ghost" 
          onClick={onExit} 
          className="text-destructive hover:text-destructive gap-1"
        >
          <XCircle className="h-4 w-4" />
          Exit
        </Button>
      </div>
    </div>
  );
};

export default InterviewControls;
