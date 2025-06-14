"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { roadmapService, LearningRoadmap } from '@/service/RoadmapService';
import { useAuth } from '@/hooks/useAuth';
import EnhancedLearningRoadmap from '@/components/learning/EnhancedLearningRoadmap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const RoadmapViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roadmapId = Array.isArray(params.roadmapId) ? params.roadmapId[0] : params.roadmapId;

  useEffect(() => {
    const loadRoadmap = async () => {
      try {        setLoading(true);
        
        // Set current user in roadmap service
        roadmapService.setCurrentUser(userData?.uid || null);
        
        let currentRoadmap: LearningRoadmap;
          switch (roadmapId) {
          case 'frontend':
            currentRoadmap = await roadmapService.getFrontendRoadmap();
            break;
          case 'backend':
            currentRoadmap = await roadmapService.getBackendRoadmap();
            break;
          case 'fullstack':
            currentRoadmap = await roadmapService.getFullstackRoadmap();
            break;          default:
            // Handle custom roadmaps
            if (roadmapId && roadmapId.startsWith('custom-') && userData?.uid) {
              const customRoadmap = await roadmapService.getCustomRoadmap(userData.uid, roadmapId);
              if (customRoadmap) {
                currentRoadmap = customRoadmap;
              } else {
                setError('Custom roadmap not found');
                return;
              }
            } else {
              setError('Roadmap not found');
              return;
            }
            break;
        }
        
        setRoadmap(currentRoadmap);
      } catch (err) {
        console.error('Error loading roadmap:', err);
        setError('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    if (roadmapId) {
      loadRoadmap();
    }
  }, [roadmapId, userData?.uid]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Roadmap Not Found</CardTitle>
            </div>            <CardDescription>
              The roadmap you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => router.push('/learning')}>
                View All Roadmaps
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
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
          <h1 className="text-3xl font-bold">{roadmap.title}</h1>
          <p className="text-lg text-muted-foreground">{roadmap.description}</p>
        </div>
      </div>      <EnhancedLearningRoadmap 
        initialCategory={roadmap.category === 'custom' ? 'frontend' : roadmap.category as 'frontend' | 'backend' | 'fullstack'}
        userData={userData ? { ...userData, uid: userData.uid } as { uid: string; [key: string]: unknown } : undefined}
        roadmapData={roadmap}
      />
    </div>
  );
};

export default RoadmapViewPage;
