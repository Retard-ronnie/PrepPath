"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, AlertCircle } from "lucide-react";
import { type Answer } from "@/context/InterviewContext";

export type DetectionResult = {
  timestamp: number;
  faces: number;
  lookingAway: boolean;
  multiplePeople: boolean;
};

interface InterviewRecorderProps {
  interviewId: string;
  interviewTitle: string;
  isActive: boolean;
  answers: Answer[];
  onDetectionUpdate?: (result: DetectionResult) => void;
}

const InterviewRecorder = ({
  interviewId,
  interviewTitle,
  isActive,
  answers,
  onDetectionUpdate,
}: InterviewRecorderProps) => {
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const alertThresholdReached = useRef(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
    // Create a ref to store the detection update function
  const detectionUpdateRef = useRef<(result: DetectionResult) => void>((result) => {
    setDetectionResults(prev => [...prev, result]);
    // Also forward to external handler if provided
    if (onDetectionUpdate) {
      onDetectionUpdate(result);
    }
  });
  
  // Expose the handleDetectionUpdate function for other components
  useEffect(() => {
    // Update ref when props change
    detectionUpdateRef.current = (result) => {
      setDetectionResults(prev => [...prev, result]);
      if (onDetectionUpdate) {
        onDetectionUpdate(result);
      }
    };
      // Attach to window for testing
    if (typeof window !== 'undefined') {
      (window as Window & typeof globalThis & { __detectionUpdate?: (result: DetectionResult) => void }).__detectionUpdate = detectionUpdateRef.current;
    }
    
    return () => {
      // Clean up
      if (typeof window !== 'undefined') {
        delete (window as Window & typeof globalThis & { __detectionUpdate?: (result: DetectionResult) => void }).__detectionUpdate;
      }
    };
  }, [onDetectionUpdate]);
  
  // Check for attention threshold
  useEffect(() => {
    // Check if there's a high percentage of looking away or multiple people
    if (!isActive || detectionResults.length < 10) return;
    
    const recentResults = detectionResults.slice(-10);
    const lookingAwayCount = recentResults.filter(r => r.lookingAway).length;
    const multipleCount = recentResults.filter(r => r.multiplePeople).length;
    
    if ((lookingAwayCount > 5 || multipleCount > 3) && !alertThresholdReached.current) {
      alertThresholdReached.current = true;
      setShowAlertDialog(true);
      
      // Reset the threshold after some time
      setTimeout(() => {
        alertThresholdReached.current = false;
      }, 30000); // 30 seconds cooldown
    }
  }, [detectionResults, isActive]);
  
  const handleExport = () => {
    const exportData = {
      interviewId,
      interviewTitle,
      exportDate: new Date().toISOString(),
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.text,
      })),
      faceDetectionData: {
        totalSamples: detectionResults.length,
        lookingAway: detectionResults.filter(r => r.lookingAway).length,
        multiplePeople: detectionResults.filter(r => r.multiplePeople).length,
        noFaceDetected: detectionResults.filter(r => r.faces === 0).length,
        attentionScore: calculateAttentionScore(detectionResults),
      }
    };
    
    setExportData(JSON.stringify(exportData, null, 2));
    setShowExportDialog(true);
  };
  
  const downloadResults = () => {
    if (!exportData) return;
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-results-${interviewId}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setShowExportDialog(false);
  };
  
  const calculateAttentionScore = (results: DetectionResult[]): number => {
    if (results.length === 0) return 100;
    
    const violations = results.filter(r => r.lookingAway || r.multiplePeople || r.faces === 0).length;
    const score = 100 - (violations / results.length) * 100;
    return Math.round(Math.max(0, score));
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        className="ml-auto" 
        onClick={handleExport}
        disabled={!isActive || detectionResults.length === 0}
      >
        <Download className="mr-2 h-4 w-4" />
        Export Results
      </Button>
      
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              Attention Required
            </AlertDialogTitle>
            <AlertDialogDescription>              We&apos;ve detected that you may not be focusing on the interview. 
              Please make sure you&apos;re facing the camera and no other people are visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Interview Results</AlertDialogTitle>
            <AlertDialogDescription>
              Your interview results are ready to download. The file includes your answers and attention metrics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 max-h-[200px] overflow-y-auto rounded bg-muted p-4">
            <pre className="text-xs">{exportData}</pre>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={downloadResults}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InterviewRecorder;
