"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Question } from "@/context/InterviewContext";

interface QuestionNavigationProps {
  questions: Question[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  completedQuestions: string[];
}

const QuestionNavigation = ({
  questions,
  currentQuestionIndex,
  onQuestionSelect,
  completedQuestions
}: QuestionNavigationProps) => {
  const [isSticky, setIsSticky] = useState(false);

  // Add scroll event listener to make the navigation sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`w-full ${isSticky ? 'sticky top-20' : ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Questions</h3>
        <p className="text-sm text-muted-foreground">
          Navigate between questions
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-2">
          {questions.map((question, index) => {
            const isCompleted = completedQuestions.includes(question.id);
            const isCurrent = currentQuestionIndex === index;
            
            return (
              <Button
                key={question.id}
                variant={isCurrent ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto py-3 ${
                  isCompleted && !isCurrent ? "bg-green-50 border-green-200 hover:bg-green-100" : ""
                }`}
                onClick={() => onQuestionSelect(index)}
              >
                <div className="flex items-center">
                  <div className={`flex items-center justify-center rounded-full w-6 h-6 mr-2 text-xs ${
                    isCurrent ? "bg-white text-primary" : 
                    isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="truncate max-w-[180px]">
                    {question.text.length > 50
                      ? `${question.text.substring(0, 50)}...`
                      : question.text}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuestionNavigation;
