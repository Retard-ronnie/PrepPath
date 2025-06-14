"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CameraMonitorProps {
  isActive: boolean;
}

const CameraMonitor = ({ isActive }: CameraMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  // ⏳ Load face-api models
  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      console.log("Face-api models loaded");
    } catch (e) {
      console.error("Error loading face-api models", e);
      setError("Failed to load face detection models.");
    }
  };

  // 🎯 Face detection loop
  const runFaceDetection = (video: HTMLVideoElement) => {
    const detect = async () => {
      if (!video.paused && !video.ended) {
        const result = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (result) {
          console.log("Face detected!", result);
        }
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

  // 📷 Setup camera and attach face-api
  const setupCamera = useCallback(async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        setStream(mediaStream);

        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              console.log("Video started");
              setCameraActive(true);
              setNeedsUserInteraction(false);
              runFaceDetection(video); // 🔁 Start detection
            })
            .catch((err) => {
              console.error("Autoplay blocked", err);
              if (err.name === "NotAllowedError") {
                setNeedsUserInteraction(true);
              } else {
                setError("Video playback failed: " + err.message);
              }
            });
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (error.name === "NotFoundError") {
        setError("No camera found. Please connect a camera.");
      } else {
        setError("Camera error: " + error.message);
      }      setCameraActive(false);
    }
  }, []);

  // 🚀 Start camera on activation
  useEffect(() => {
    loadModels(); // Preload models
  }, []);
  useEffect(() => {
    if (isActive && !stream) {
      setupCamera();
    }
  }, [isActive, setupCamera, stream]);

  // 🧹 Clean up on unmount
  useEffect(() => {
    const currentStream = stream;
    const currentVideo = videoRef.current;
    
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        console.log("Camera stopped");
      }
      if (currentVideo) {
        currentVideo.srcObject = null;
      }
      setCameraActive(false);
      setNeedsUserInteraction(false);
    };
  }, [stream]);

  // 🖱️ User click to start video
  const startVideoPlayback = () => {
    if (videoRef.current && stream) {
      videoRef.current
        .play()
        .then(() => {
          setNeedsUserInteraction(false);
          setCameraActive(true);
        })
        .catch((err) => {
          console.error("User-initiated video start failed:", err);
          setError("Failed to play video: " + err.message);
        });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Camera Monitor</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-full max-w-[320px] overflow-hidden rounded-md bg-gray-900">
          <video
            ref={videoRef}
            muted
            playsInline
            width={320}
            height={240}
            className="w-full h-auto"
            style={{ minHeight: "240px" }}
          />

          {/* Loading overlay */}
          {!cameraActive && !error && !needsUserInteraction && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Starting camera...</p>
              </div>
            </div>
          )}

          {/* User interaction required */}
          {needsUserInteraction && (
            <div
              onClick={startVideoPlayback}
              className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 text-white cursor-pointer hover:bg-opacity-90"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">▶️</div>
                <p>Click to start camera</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white p-4 text-center">
              <p className="text-red-200 mb-3">⚠️ {error}</p>
              <button
                onClick={setupCamera}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Status display */}
        <div className="w-full mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Camera Status:</span>
            <span className={`font-semibold ${cameraActive ? "text-green-600" : "text-red-600"}`}>
              {cameraActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraMonitor;
