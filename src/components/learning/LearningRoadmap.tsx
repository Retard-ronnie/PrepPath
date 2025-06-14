// filepath: src/components/learning/LearningRoadmap.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Code, 
  Database, 
  Globe, 
  PlayCircle,
  Target,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Share2,
  Download,
  GitBranch,
  Star,
  Award
} from 'lucide-react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { roadmapService, LearningRoadmap, LearningTopic, UserProgress } from '@/service/RoadmapService';
import { useAuth } from '@/hooks/useAuth';

// Custom Node Component for ReactFlow
const CustomNode = ({ data }: { data: {
  topic: LearningTopic;
  isCompleted: boolean;
  isInProgress: boolean;
  canStart: boolean;
  onTopicStart: (id: string) => void;
  onTopicComplete: (id: string) => void;
} }) => {
  const { topic, isCompleted, isInProgress, canStart, onTopicStart, onTopicComplete } = data;
    return (
    <div className={`p-3 rounded-lg border-2 min-w-[200px] ${
      isCompleted 
        ? 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-400' 
        : isInProgress 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
        : canStart
        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 dark:border-amber-400'
        : 'border-border bg-muted'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          isCompleted ? 'bg-green-600 dark:bg-green-500' : isInProgress ? 'bg-blue-600 dark:bg-blue-500' : canStart ? 'bg-amber-600 dark:bg-amber-500' : 'bg-muted-foreground'
        }`}>
          {isCompleted ? (
            <CheckCircle className="h-4 w-4 text-white" />
          ) : isInProgress ? (
            <PlayCircle className="h-4 w-4 text-white" />
          ) : (
            <BookOpen className="h-4 w-4 text-white" />
          )}
        </div>
        <h3 className="text-sm font-semibold truncate">{topic.title}</h3>
      </div>
      
      <div className="space-y-2">
        <Badge variant="outline" className="text-xs">
          {topic.difficulty}
        </Badge>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {topic.estimatedHours}h
        </div>
        
        {(isCompleted || isInProgress) && (
          <Progress value={topic.progress || 0} className="h-1" />
        )}
        
        {!isCompleted && canStart && (
          <Button 
            size="sm" 
            className="w-full text-xs h-7"
            variant={isInProgress ? "secondary" : "default"}
            onClick={() => isInProgress ? onTopicComplete(topic.id) : onTopicStart(topic.id)}
          >
            {isInProgress ? 'Complete' : 'Start'}
          </Button>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface LearningRoadmapProps {
  className?: string;
}

const LearningRoadmapComponent: React.FC<LearningRoadmapProps> = ({ className }) => {  
  const { userData } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'frontend' | 'backend' | 'fullstack'>('frontend');
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recommendedTopics, setRecommendedTopics] = useState<LearningTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'analytics'>('list');
  // Generate progress data for charts
  const generateProgressData = () => {
    if (!roadmap || !userProgress) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        progress: Math.max(0, roadmap.overallProgress - (i * 5) + Math.random() * 10)
      };
    }).reverse();
    
    return last7Days;
  };

  const generateSkillData = () => {
    if (!roadmap) return [];
    
    const skillCategories = [...new Set(roadmap.nodes.map(node => node.topic.category))];
    return skillCategories.map(category => {
      const categoryTopics = roadmap.nodes.filter(node => node.topic.category === category);
      const completedInCategory = categoryTopics.filter(node => 
        userProgress?.completedTopics.includes(node.topic.id)
      ).length;
      
      return {
        name: category,
        completed: completedInCategory,
        total: categoryTopics.length,
        percentage: Math.round((completedInCategory / categoryTopics.length) * 100)
      };
    });  };
  useEffect(() => {
    const loadRoadmapData = async () => {
      try {
        setIsLoading(true);
        
        // Set current user in roadmap service
        roadmapService.setCurrentUser(userData?.uid || null);
          // Get user progress (will use Firebase if authenticated, localStorage otherwise)
        const progress = await roadmapService.getUserProgress();
        setUserProgress(progress);

        let currentRoadmap: LearningRoadmap;
        switch (selectedCategory) {
          case 'frontend':
            currentRoadmap = await roadmapService.getFrontendRoadmap();
            break;
          case 'backend':
            currentRoadmap = await roadmapService.getBackendRoadmap();
            break;
          case 'fullstack':
            currentRoadmap = await roadmapService.getFullstackRoadmap();
            break;
        }

        // Update progress in roadmap
        currentRoadmap.nodes.forEach(node => {
          if (progress.completedTopics.includes(node.topic.id)) {
            node.topic.completed = true;
            node.topic.progress = 100;
          } else if (progress.currentTopics.includes(node.topic.id)) {
            node.topic.progress = 50;
          }
        });

        // Calculate overall progress
        const totalTopics = currentRoadmap.nodes.length;
        const completedCount = progress.completedTopics.filter(topicId => 
          currentRoadmap.nodes.some(node => node.topic.id === topicId)
        ).length;
        currentRoadmap.overallProgress = Math.round((completedCount / totalTopics) * 100);

        setRoadmap(currentRoadmap);
          // Get recommendations using async method with current progress
        const recommendations = await roadmapService.getRecommendedNextTopics(selectedCategory, progress);
        setRecommendedTopics(recommendations);
        
      } catch (error) {
        console.error('Error loading roadmap data:', error);
        // Fallback to non-authenticated mode if error occurs
        roadmapService.setCurrentUser(null);
        const fallbackProgress = {
          completedTopics: [],
          currentTopics: [],
          timeSpent: {},
          skillLevel: {}
        };
        setUserProgress(fallbackProgress);
        
        let currentRoadmap: LearningRoadmap;
        switch (selectedCategory) {
          case 'frontend':
            currentRoadmap = await roadmapService.getFrontendRoadmap();
            break;
          case 'backend':
            currentRoadmap = await roadmapService.getBackendRoadmap();
            break;
          case 'fullstack':
            currentRoadmap = await roadmapService.getFullstackRoadmap();
            break;
        }
        setRoadmap(currentRoadmap);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoadmapData();
  }, [selectedCategory, userData?.uid]);

  // Separate effect for ReactFlow nodes and edges to avoid infinite loops
  useEffect(() => {
    if (!roadmap || !userProgress) return;

    const flowNodes = roadmap.nodes.map((node) => {
      const isCompleted = userProgress.completedTopics.includes(node.topic.id);
      const isInProgress = userProgress.currentTopics.includes(node.topic.id);
      const canStart = node.topic.prerequisites.every(prereq => 
        userProgress.completedTopics.includes(prereq)
      );
      
      return {
        id: node.id,
        type: 'custom',
        position: { x: node.position.x, y: node.position.y },
        data: {
          topic: node.topic,
          isCompleted,
          isInProgress,
          canStart,
          onTopicStart: handleTopicStart,
          onTopicComplete: handleTopicComplete
        }
      };
    });    const flowEdges = roadmap.nodes.flatMap(node => 
      node.connections.map(connection => ({
        id: `${node.id}-${connection}`,
        source: node.id,
        target: connection,
        type: 'smoothstep',
        style: { 
          stroke: 'hsl(var(--primary))', 
          strokeWidth: 2,
          opacity: 0.8
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
          width: 20,
          height: 20
        },
      }))
    );

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [roadmap, userProgress, setNodes, setEdges]);
  const handleTopicStart = async (topicId: string) => {
    try {
      await roadmapService.addCurrentTopic(topicId);
      const updatedProgress = await roadmapService.getUserProgress();
      setUserProgress(updatedProgress);
    } catch (error) {
      console.error('Error starting topic:', error);
    }
  };

  const handleTopicComplete = async (topicId: string) => {
    try {
      await roadmapService.markTopicComplete(topicId);
      const updatedProgress = await roadmapService.getUserProgress();
      setUserProgress(updatedProgress);
    } catch (error) {
      console.error('Error completing topic:', error);
    }
  };
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend': return <Globe className="h-5 w-5" />;
      case 'backend': return <Database className="h-5 w-5" />;
      case 'fullstack': return <Code className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Learning Roadmaps</CardTitle>
            </div>
            <CardDescription>
              Loading your personalized learning path...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!roadmap || !userProgress) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Learning Roadmaps</CardTitle>
            </div>
            <CardDescription>
              No roadmap data available. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Learning Roadmaps
          </CardTitle>
          <CardDescription>
            Choose your learning path and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>          <Tabs value={selectedCategory} onValueChange={(value: string) => setSelectedCategory(value as 'frontend' | 'backend' | 'fullstack')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="frontend" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Frontend
              </TabsTrigger>
              <TabsTrigger value="backend" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Backend
              </TabsTrigger>
              <TabsTrigger value="fullstack" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Full Stack
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Overall Progress</span>
                      </div>
                      <div className="space-y-2">
                        <Progress value={roadmap.overallProgress} className="h-2" />
                        <p className="text-2xl font-bold">{roadmap.overallProgress}%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">Completed Topics</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {userProgress.completedTopics.filter(topicId => 
                          roadmap.nodes.some(node => node.topic.id === topicId)
                        ).length}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium">Estimated Duration</span>
                      </div>
                      <p className="text-2xl font-bold">{roadmap.estimatedDuration}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommended Next Topics */}
                {recommendedTopics.length > 0 && (
                  <Card>
                    <CardHeader>                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        Recommended Next Steps
                      </CardTitle><CardDescription>
                        Based on your progress, here&apos;s what you should learn next
                      </CardDescription>
                    </CardHeader>
                    <CardContent>                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendedTopics.map((topic) => (
                          <Card key={topic.id} className="border-2 hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start mb-2">
                                <CardTitle className="text-lg">{topic.title}</CardTitle>
                                <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
                                  {topic.difficulty}
                                </Badge>
                              </div>
                              <CardDescription className="text-sm">
                                {topic.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {topic.estimatedHours}h
                                  </span>
                                  <Badge variant="secondary">{topic.category}</Badge>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="w-full" 
                                  onClick={() => handleTopicStart(topic.id)}
                                  disabled={userProgress.currentTopics.includes(topic.id)}
                                >
                                  {userProgress.currentTopics.includes(topic.id) ? 'In Progress' : 'Start Learning'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}                {/* Enhanced Learning Path Visualization */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getCategoryIcon(selectedCategory)}
                          {roadmap.title}
                        </CardTitle>
                        <CardDescription>{roadmap.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={viewMode === 'list' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          List
                        </Button>
                        <Button
                          variant={viewMode === 'graph' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('graph')}
                        >
                          <GitBranch className="h-4 w-4 mr-1" />
                          Graph
                        </Button>
                        <Button
                          variant={viewMode === 'analytics' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setViewMode('analytics')}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {viewMode === 'list' && (
                      <div className="space-y-4">
                        {roadmap.nodes.map((node) => {
                          const topic = node.topic;
                          const isCompleted = userProgress.completedTopics.includes(topic.id);
                          const isInProgress = userProgress.currentTopics.includes(topic.id);
                          const canStart = topic.prerequisites.every(prereq => 
                            userProgress.completedTopics.includes(prereq)
                          );

                          return (
                            <div key={topic.id} className="relative">                              <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors ${
                                isCompleted 
                                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                                  : isInProgress 
                                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                                  : canStart
                                  ? 'border-amber-200 bg-amber-50 hover:border-amber-300 dark:border-amber-800 dark:bg-amber-950 dark:hover:border-amber-700'
                                  : 'border-border bg-muted'
                              }`}>
                                {/* Status Icon */}                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-green-600 text-white dark:bg-green-500' 
                                    : isInProgress
                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                    : canStart
                                    ? 'bg-amber-600 text-white dark:bg-amber-500'
                                    : 'bg-muted-foreground text-white'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="h-6 w-6" />
                                  ) : isInProgress ? (
                                    <PlayCircle className="h-6 w-6" />
                                  ) : (
                                    <BookOpen className="h-6 w-6" />
                                  )}
                                </div>

                                {/* Topic Content */}
                                <div className="flex-grow">
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{topic.title}</h3>
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
                                        {topic.difficulty}
                                      </Badge>
                                      <Badge variant="secondary">{topic.category}</Badge>
                                    </div>
                                  </div>
                                  
                                  <p className="text-muted-foreground mb-3">{topic.description}</p>
                                  
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {topic.estimatedHours} hours
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {topic.resources.length} resources
                                    </span>
                                  </div>

                                  {/* Progress Bar */}
                                  {(isCompleted || isInProgress) && (
                                    <div className="mb-3">
                                      <Progress value={topic.progress} className="h-2" />
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    {!isCompleted && canStart && (
                                      <Button 
                                        size="sm" 
                                        variant={isInProgress ? "secondary" : "default"}
                                        onClick={() => isInProgress ? handleTopicComplete(topic.id) : handleTopicStart(topic.id)}
                                      >
                                        {isInProgress ? 'Mark Complete' : 'Start Learning'}
                                      </Button>
                                    )}
                                    <Button size="sm" variant="outline">
                                      View Resources
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}                    {viewMode === 'graph' && (
                      <div className="h-[600px] border rounded-lg bg-background">
                        <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          nodeTypes={nodeTypes}
                          connectionMode={ConnectionMode.Loose}
                          fitView
                          attributionPosition="bottom-left"
                          className="bg-background"
                        >
                          <Background 
                            variant={BackgroundVariant.Dots} 
                            gap={20} 
                            size={1.5} 
                            className="opacity-30"
                            color="hsl(var(--muted-foreground))"
                          />
                          <Controls 
                            className="bg-background border border-border shadow-lg rounded-lg [&>button]:bg-background [&>button]:border-border [&>button]:text-foreground [&>button:hover]:bg-accent" 
                          />
                          <MiniMap 
                            className="bg-background border border-border rounded-lg"
                            maskColor="hsl(var(--muted) / 0.1)"
                            nodeColor={(node) => {
                              if (node.data.isCompleted) return 'hsl(var(--chart-2))';
                              if (node.data.isInProgress) return 'hsl(var(--chart-1))';
                              if (node.data.canStart) return 'hsl(var(--chart-3))';
                              return 'hsl(var(--muted-foreground))';
                            }}
                          />
                        </ReactFlow>
                      </div>
                    )}{viewMode === 'analytics' && (
                      <div className="space-y-6">
                        {/* Progress Over Time Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5" />
                              Progress Over Time
                            </CardTitle>
                            <CardDescription>
                              Track your learning progress over the past week
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart 
                                data={generateProgressData()}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid 
                                  strokeDasharray="3 3" 
                                  stroke="hsl(var(--border))"
                                  opacity={0.5}
                                />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="hsl(var(--foreground))"
                                  fontSize={12}
                                  tick={{ fill: 'hsl(var(--foreground))' }}
                                />
                                <YAxis 
                                  stroke="hsl(var(--foreground))"
                                  fontSize={12}
                                  tick={{ fill: 'hsl(var(--foreground))' }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--foreground))',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="progress" 
                                  stroke="hsl(var(--primary))" 
                                  strokeWidth={3}
                                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Skills Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Skills by Category
                              </CardTitle>
                              <CardDescription>
                                Progress breakdown across different skill areas
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart 
                                  data={generateSkillData()}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                >
                                  <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="hsl(var(--border))"
                                    opacity={0.5}
                                  />
                                  <XAxis 
                                    dataKey="name" 
                                    stroke="hsl(var(--foreground))"
                                    fontSize={12}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tick={{ fill: 'hsl(var(--foreground))' }}
                                  />
                                  <YAxis 
                                    stroke="hsl(var(--foreground))"
                                    fontSize={12}
                                    tick={{ fill: 'hsl(var(--foreground))' }}
                                  />
                                  <Tooltip 
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--background))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '8px',
                                      color: 'hsl(var(--foreground))',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value) => [`${value}%`, 'Completion']}
                                  />
                                  <Bar 
                                    dataKey="percentage" 
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Completion Status
                              </CardTitle>
                              <CardDescription>
                                Overall completion distribution
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>                                  <Pie
                                    data={[
                                      { 
                                        name: 'Completed', 
                                        value: userProgress.completedTopics.length, 
                                        fill: 'hsl(var(--chart-2))'
                                      },
                                      { 
                                        name: 'In Progress', 
                                        value: userProgress.currentTopics.length, 
                                        fill: 'hsl(var(--chart-1))'
                                      },
                                      { 
                                        name: 'Not Started', 
                                        value: roadmap.nodes.length - userProgress.completedTopics.length - userProgress.currentTopics.length, 
                                        fill: 'hsl(var(--muted))'
                                      }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    dataKey="value"
                                    stroke="hsl(var(--border))"
                                    strokeWidth={2}
                                  />
                                  <Tooltip 
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--background))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '8px',
                                      color: 'hsl(var(--foreground))',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                  />
                                  <Legend 
                                    wrapperStyle={{
                                      color: 'hsl(var(--foreground))',
                                      fontSize: '14px'
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Additional Analytics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Total Study Time</p>
                                  <p className="text-2xl font-bold">
                                    {roadmap.nodes.reduce((acc, node) => acc + (node.topic.estimatedHours || 0), 0)}h
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                                  <p className="text-2xl font-bold">
                                    {roadmap.nodes.length > 0 ? Math.round((userProgress.completedTopics.length / roadmap.nodes.length) * 100) : 0}%
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Active Topics</p>
                                  <p className="text-2xl font-bold">{userProgress.currentTopics.length}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningRoadmapComponent;
