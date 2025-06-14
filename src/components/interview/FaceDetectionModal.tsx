"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FaceDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: () => void;
}

const FaceDetectionModal = ({
  isOpen,
  onClose,
  onStartInterview,
}: FaceDetectionModalProps) => {
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [isLoading, setIsLoading] = useState(false);

  const requestCameraPermission = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission("granted");
      
      // Stop the stream immediately after permission is granted
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Camera permission denied:", error);
      setCameraPermission("denied");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInterview = () => {
    onStartInterview();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Camera Access Required</DialogTitle>
          <DialogDescription>
            This interview requires face detection to monitor your attention. Please grant camera access to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {cameraPermission === "pending" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                We need permission to use your camera for face detection during the interview.
                Your video will not be recorded or shared.
              </p>
              <Button onClick={requestCameraPermission} disabled={isLoading}>
                {isLoading ? "Requesting Access..." : "Grant Camera Access"}
              </Button>
            </div>
          )}

          {cameraPermission === "granted" && (
            <div className="flex items-center space-x-4 rounded-lg border p-4 bg-green-50">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Access Granted</h4>
                <p className="text-sm text-green-700">
                  You can now proceed with the interview.
                </p>
              </div>
            </div>
          )}

          {cameraPermission === "denied" && (
            <div className="flex items-center space-x-4 rounded-lg border p-4 bg-red-50">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">Access Denied</h4>
                <p className="text-sm text-red-700">
                  Please enable camera access in your browser settings and try again.
                </p>
              </div>
            </div>
          )}
        </div>        <DialogFooter>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleStartInterview}
              disabled={cameraPermission !== "granted"}
            >
              Start Interview
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FaceDetectionModal;