"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle } from "lucide-react";

interface FaceDetectionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'warning' | 'violation' | null;
  timeWithoutFace?: number;
  warningCount?: number;
  onResume?: () => void;
}

const FaceDetectionWarningModal = ({ 
  isOpen, 
  onClose, 
  type, 
  timeWithoutFace = 0, 
  warningCount = 0,
  onResume
}: FaceDetectionWarningModalProps) => {
  const [countdown, setCountdown] = useState(5);
  
  // Countdown timer for auto-resume
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && type === 'warning') {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onResume) onResume();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
      setCountdown(5);
    };
  }, [isOpen, type, onResume]);
  
  // Content varies based on modal type
  const renderContent = () => {
    if (type === 'warning') {
      return (
        <div>
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Face Detection Warning
            </DialogTitle>
            <DialogDescription>
              We can&apos;t detect your face in the camera. Please make sure you&apos;re positioned correctly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              The interview will resume automatically in {countdown} seconds, or you can resume now.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Resume Now</Button>
          </DialogFooter>
        </div>
      );
    } 
    
    if (type === 'violation') {
      return (
        <div>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              Face Detection Violation
            </DialogTitle>
            <DialogDescription>
              We couldn&apos;t detect your face for {timeWithoutFace} seconds. This will be recorded in your interview results.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">
              Face detection violations: {warningCount}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Excessive violations may affect your interview results.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>I Understand</Button>
          </DialogFooter>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default FaceDetectionWarningModal;
