"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { roadmapService, LearningTopic } from '@/service/RoadmapService';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  Video, 
  MonitorPlay, 
  Dumbbell,
  Clock,
  Star,
  BookOpen,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

const ResourcesPage = () => {
  const params = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  const [topic, setTopic] = useState<LearningTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video': return <Video className="h-5 w-5 text-red-600" />;
      case 'course': return <MonitorPlay className="h-5 w-5 text-green-600" />;
      case 'practice': return <Dumbbell className="h-5 w-5 text-purple-600" />;
      default: return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'video': return 'bg-red-100 text-red-800 border-red-200';
      case 'course': return 'bg-green-100 text-green-800 border-green-200';
      case 'practice': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    const loadTopic = async () => {
      try {
        setLoading(true);
        
        // Set current user in roadmap service
        roadmapService.setCurrentUser(userData?.uid || null);
        
        // Find the topic from all available roadmaps
        let foundTopic: LearningTopic | null = null;
          // Check curated roadmaps first
        const roadmaps = [
          await roadmapService.getFrontendRoadmap(),
          await roadmapService.getBackendRoadmap(),
          await roadmapService.getFullstackRoadmap()
        ];
        
        for (const roadmap of roadmaps) {
          const topicNode = roadmap.nodes.find(node => node.topic.id === topicId);
          if (topicNode) {
            foundTopic = topicNode.topic;
            break;
          }
        }
        
        // If not found in curated roadmaps, check custom roadmaps
        if (!foundTopic && userData?.uid) {
          try {
            const customRoadmaps = await roadmapService.getCustomRoadmaps(userData.uid);
            for (const roadmap of customRoadmaps) {
              const topicNode = roadmap.nodes.find(node => node.topic.id === topicId);
              if (topicNode) {
                foundTopic = topicNode.topic;
                break;
              }
            }
          } catch (err) {
            console.error('Error loading custom roadmaps:', err);
          }
        }
        
        if (foundTopic) {
          setTopic(foundTopic);
        } else {
          setError('Topic not found');
        }
      } catch (err) {
        console.error('Error loading topic:', err);
        setError('Failed to load topic resources');
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      loadTopic();
    }
  }, [topicId, userData?.uid]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Resources Not Found</CardTitle>
            </div>
            <CardDescription>
              The learning resources you&apos;re looking for don&apos;t exist or couldn&apos;t be loaded.
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
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button 
          onClick={() => router.back()}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roadmap
        </Button>
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{topic.title}</h1>
              <p className="text-lg text-muted-foreground">{topic.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {topic.completed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : topic.progress > 0 ? (
                <PlayCircle className="h-8 w-8 text-blue-600" />
              ) : (
                <BookOpen className="h-8 w-8 text-gray-600" />
              )}
            </div>
          </div>
          
          {/* Topic Meta Info */}
          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
              {topic.difficulty}
            </Badge>
            <Badge variant="secondary">{topic.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {topic.estimatedHours} hours
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              {topic.resources.length} resources
            </div>
          </div>
          
          {/* Progress Bar */}
          {topic.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{topic.progress}%</span>
              </div>
              <Progress value={topic.progress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Learning Resources</h2>
          
          {topic.resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Resources Available</h3>
                <p className="text-muted-foreground">
                  Resources for this topic are being prepared. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topic.resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getResourceTypeColor(resource.type)}`}
                        >
                          {resource.type}
                        </Badge>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {resource.duration && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {resource.duration}
                        </div>
                      )}
                      
                      <Button 
                        className="w-full"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Learn?</CardTitle>
            <CardDescription>
              Take action on your learning journey with these resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {!topic.completed && (
                <>
                  {topic.progress === 0 ? (
                    <Button 
                      onClick={async () => {
                        await roadmapService.addCurrentTopic(topic.id);
                        router.back();
                      }}
                      className="flex-1"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={async () => {
                        await roadmapService.markTopicComplete(topic.id);
                        router.back();
                      }}
                      variant="secondary"
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </>
              )}
              <Button 
                variant="outline" 
                onClick={() => router.push('/learning')}
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View All Roadmaps
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResourcesPage;
