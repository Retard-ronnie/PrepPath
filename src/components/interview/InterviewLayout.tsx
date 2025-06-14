import React from 'react';
import InterviewTimer from './InterviewTimer';

interface InterviewLayoutProps {
  title: string;
  duration: number; // in minutes
  onTimeUp?: () => void;
  children: React.ReactNode;
}

const InterviewLayout: React.FC<InterviewLayoutProps> = ({
  title,
  duration,
  onTimeUp,
  children,
}) => {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <InterviewTimer duration={duration} onTimeUp={onTimeUp} />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {children}
      </div>
    </div>
  );
};

export default InterviewLayout;
