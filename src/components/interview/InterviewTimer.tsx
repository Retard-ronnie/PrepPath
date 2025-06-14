import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface InterviewTimerProps {
  duration: number; // Duration in minutes
  onTimeUp?: () => void;
}

const InterviewTimer: React.FC<InterviewTimerProps> = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Set warning when less than 5 minutes left
    if (timeLeft <= 300 && !isWarning) {
      setIsWarning(true);
    }

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, isWarning]);

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
      isWarning 
        ? 'bg-red-100 text-red-700 animate-pulse' 
        : 'bg-gray-100 text-gray-700'
    }`}>
      <Clock className="h-4 w-4" />
      <span className="font-medium">{formatTime()}</span>
    </div>
  );
};

export default InterviewTimer;
