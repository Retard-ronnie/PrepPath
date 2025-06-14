"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { roadmapService, LearningRoadmap } from '@/service/RoadmapService';
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  Target, 
  BookOpen, 
  Trash2, 
  Eye,
  Calendar,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CustomRoadmapsPage = () => {
  const { userData } = useAuth();
  const router = useRouter();
  const [customRoadmaps, setCustomRoadmaps] = useState<LearningRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomRoadmaps = async () => {
      if (!userData?.uid) {
        setLoading(false);
        return;
      }

      try {
        roadmapService.setCurrentUser(userData.uid);
        const roadmaps = await roadmapService.getCustomRoadmaps(userData.uid);
        setCustomRoadmaps(roadmaps);
      } catch (error) {
        console.error('Error loading custom roadmaps:', error);
        setError('Failed to load your custom roadmaps');
      } finally {
        setLoading(false);
      }
    };

    loadCustomRoadmaps();
  }, [userData?.uid]);

  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (!confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      await roadmapService.deleteCustomRoadmap(roadmapId);
      setCustomRoadmaps(prev => prev.filter(roadmap => roadmap.id !== roadmapId));
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      setError('Failed to delete the roadmap');
    }
  };
  const formatDate = (timestamp: unknown): string => {
    if (!timestamp) return 'N/A';
    
    // Handle Firebase Timestamp
    if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp) {
      const firebaseTimestamp = timestamp as { seconds: number };
      return new Date(firebaseTimestamp.seconds * 1000).toLocaleDateString();
    }
    
    // Handle regular Date
    return new Date(timestamp as string | number | Date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => router.push('/learning')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              My Custom Roadmaps
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage and explore your personalized learning paths
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/learning/create-custom')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Roadmap
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!userData?.uid ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800">Sign In Required</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Please sign in to view and manage your custom roadmaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      ) : customRoadmaps.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Custom Roadmaps Yet</h3>            <p className="text-muted-foreground mb-6 max-w-md">
              You haven&apos;t created any custom roadmaps yet. Start building your personalized learning path today!
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={() => router.push('/learning/create-custom')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Roadmap
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/learning')}
              >
                Browse Curated Roadmaps
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Roadmaps</span>
                </div>
                <p className="text-2xl font-bold">{customRoadmaps.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Topics</span>
                </div>
                <p className="text-2xl font-bold">
                  {customRoadmaps.reduce((sum, roadmap) => sum + (roadmap.nodes?.length || 0), 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Avg. Duration</span>
                </div>
                <p className="text-2xl font-bold">
                  {customRoadmaps.length > 0 
                    ? Math.round(customRoadmaps.reduce((sum, roadmap) => {
                        const match = roadmap.estimatedDuration?.match(/(\d+)/);
                        return sum + (match ? parseInt(match[1]) : 0);
                      }, 0) / customRoadmaps.length) 
                    : 0} weeks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Roadmaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customRoadmaps.map((roadmap) => (
              <Card 
                key={roadmap.id} 
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {roadmap.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {roadmap.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {roadmap.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {roadmap.nodes?.length || 0} topics
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {roadmap.estimatedDuration}
                    </span>
                  </div>

                  {/* Progress */}
                  {roadmap.overallProgress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{roadmap.overallProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${roadmap.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(roadmap.createdAt)}
                    </span>
                    {roadmap.targetLevel && (
                      <Badge variant="outline" className="text-xs">
                        {roadmap.targetLevel.replace('-', ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/learning/roadmap/${roadmap.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteRoadmap(roadmap.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomRoadmapsPage;