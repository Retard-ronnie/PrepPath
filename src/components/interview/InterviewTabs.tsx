import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInterview } from '@/context/InterviewContext';

interface InterviewTabsProps {
  interviewId: string;
}

const InterviewTabs: React.FC<InterviewTabsProps> = ({ interviewId }) => {
  const router = useRouter();
  const { interview } = useInterview();
  
  return (
    <div className="container max-w-6xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{interview?.title || 'Interview'}</h1>
        <p className="text-muted-foreground">{interview?.description}</p>
      </div>
      
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="space-y-4">
          {interview?.questions.map((question, index) => (
            <Card key={question.id} className="p-4 cursor-pointer hover:bg-gray-50" 
                  onClick={() => router.push(`/interview/${interviewId}/question/${index + 1}`)}>
              <div className="flex justify-between items-center">
                <span className="font-medium">Question {index + 1}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {question.difficulty}
                </span>
              </div>
              <p className="mt-2 line-clamp-2">{question.text}</p>
            </Card>
          ))}
          
          <div className="mt-6">
            <Button onClick={() => router.push(`/interview/${interviewId}/start`)}>
              Start Interview
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="resources">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Helpful Resources</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Data Structures and Algorithms Review</li>
              <li>System Design Primer</li>
              <li>JavaScript Interview Questions</li>
              <li>RESTful API Design Guidelines</li>
              <li>GraphQL Documentation</li>
            </ul>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Personal Notes</h3>
            <p className="text-muted-foreground">You haven&apos;t added any notes yet.</p>
            <Button variant="outline" className="mt-4">Add Note</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewTabs;
