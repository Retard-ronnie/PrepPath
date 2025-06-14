"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CustomRoadmapForm from '@/components/learning/CustomRoadmapForm';
import { LearningRoadmap } from '@/service/RoadmapService';

const CreateCustomRoadmapPage = () => {
  const router = useRouter();

  const handleRoadmapCreated = (roadmap: LearningRoadmap) => {
    // Navigate to the newly created roadmap
    router.push(`/learning/roadmap/${roadmap.id}`);
  };

  const handleCancel = () => {
    router.push('/learning');
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          onClick={() => router.push('/learning')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Create Custom Learning Roadmap</h1>
          <p className="text-lg text-muted-foreground">
            Design a personalized learning path tailored to your goals and schedule
          </p>
        </div>
      </div>

      <CustomRoadmapForm 
        onRoadmapCreated={handleRoadmapCreated}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateCustomRoadmapPage;