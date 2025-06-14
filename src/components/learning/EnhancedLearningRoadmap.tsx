// filepath: src/components/learning/EnhancedLearningRoadmap.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
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
  Zap,
  BarChart3,
  Share2,
  Download,
  GitBranch,
  Star,
  Award,
  Eye,
  Network
} from 'lucide-react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';
import { roadmapService, LearningRoadmap, LearningTopic, UserProgress } from '@/service/RoadmapService';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedLearningRoadmapProps {
  className?: string;
  initialCategory?: 'frontend' | 'backend' | 'fullstack';
  userData?: { uid: string; [key: string]: unknown };
  roadmapData?: LearningRoadmap; // Pre-loaded roadmap data
}

// Define proper types for node data
interface NodeData {
  topic: LearningTopic;
  isCompleted: boolean;
  isInProgress: boolean;
  canStart: boolean;
  onStart: () => void;
  onComplete: () => void;
}

// Custom Node Component for ReactFlow with enhanced styling
const CustomNode = ({ data }: { data: NodeData }) => {
  const { topic, isCompleted, isInProgress, canStart, onStart, onComplete } = data;
  
  return (
    <div className={`group p-4 rounded-xl border-2 min-w-[200px] max-w-[250px] shadow-lg transition-all duration-300 hover:shadow-xl ${
      isCompleted 
        ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-100 hover:border-emerald-500' 
        : isInProgress 
        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 hover:border-blue-500'
        : canStart
        ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-100 hover:border-orange-500'
        : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-100 opacity-75'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
          isCompleted 
            ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' 
            : isInProgress 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
            : canStart
            ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
            : 'bg-gradient-to-br from-gray-400 to-slate-500 text-white'
        }`}>
          {isCompleted ? (
            <Award className="h-5 w-5" />
          ) : isInProgress ? (
            <PlayCircle className="h-5 w-5" />
          ) : canStart ? (
            <Target className="h-5 w-5" />
          ) : (
            <BookOpen className="h-5 w-5" />
          )}
        </div>
        <span className="font-bold text-sm text-gray-900 group-hover:text-gray-700 line-clamp-2">
          {topic.title}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
        {topic.description.substring(0, 80)}...
      </p>
      <div className="flex items-center justify-between mb-3">
        <Badge 
          variant="outline" 
          className={`text-xs font-semibold ${
            topic.difficulty === 'beginner' 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
              : topic.difficulty === 'intermediate'
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'bg-red-100 text-red-700 border-red-300'
          }`}
        >
          {topic.difficulty}
        </Badge>
        <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-full border border-gray-200">
          {topic.estimatedHours}h
        </span>
      </div>
      {!isCompleted && canStart && (
        <Button 
          size="sm" 
          className={`w-full text-xs font-semibold transition-all duration-300 ${
            isInProgress
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white'
          }`}
          onClick={isInProgress ? onComplete : onStart}
        >
          {isInProgress ? 'Complete' : 'Start'}
        </Button>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const EnhancedLearningRoadmapComponent: React.FC<EnhancedLearningRoadmapProps> = ({ 
  className, 
  initialCategory = 'frontend',
  userData: propUserData,
  roadmapData: preloadedRoadmap
}) => {
  const { userData: authUserData } = useAuth();
  const userData = propUserData || authUserData;
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'frontend' | 'backend' | 'fullstack'>(initialCategory);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recommendedTopics, setRecommendedTopics] = useState<LearningTopic[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'analytics'>('list');
  
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [loading, setLoading] = useState(true);

  // Chart color scheme
  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Effect to handle initialCategory prop changes
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory, selectedCategory]);

  // Create graph data function - stable version without recursive calls
  const createGraphData = useCallback((roadmapData: LearningRoadmap, progress: UserProgress): void => {
    const flowNodes: Node[] = roadmapData.nodes.map((node) => {
      const isCompleted = progress.completedTopics.includes(node.topic.id);
      const isInProgress = progress.currentTopics.includes(node.topic.id);
      const canStart = node.topic.prerequisites.every(prereq => 
        progress.completedTopics.includes(prereq)
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
          onStart: async () => {
            await roadmapService.addCurrentTopic(node.topic.id);
            const updatedProgress = await roadmapService.getUserProgress();
            setUserProgress(updatedProgress);
            // Don't call createGraphData here to avoid recursion
          },
          onComplete: async () => {
            await roadmapService.markTopicComplete(node.topic.id);
            const updatedProgress = await roadmapService.getUserProgress();
            setUserProgress(updatedProgress);
            // Don't call createGraphData here to avoid recursion
          }
        }
      };
    });    const flowEdges: Edge[] = [];
    roadmapData.nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const sourceCompleted = progress.completedTopics.includes(node.topic.id);
        const targetCompleted = progress.completedTopics.includes(connectionId);
        
        flowEdges.push({
          id: `${node.id}-${connectionId}`,
          source: node.id,
          target: connectionId,
          type: 'smoothstep',
          style: { 
            stroke: sourceCompleted && targetCompleted 
              ? '#10b981' 
              : sourceCompleted 
              ? '#3b82f6' 
              : '#94a3b8', 
            strokeWidth: 3,
            strokeDasharray: sourceCompleted ? '0' : '8,8'
          },
          animated: !sourceCompleted,          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: sourceCompleted && targetCompleted 
              ? '#10b981' 
              : sourceCompleted 
              ? '#3b82f6' 
              : '#94a3b8'
          }
        });
      });
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [setNodes, setEdges]);

  // Separate effect to update graph when progress changes
  useEffect(() => {
    if (roadmap && userProgress) {
      createGraphData(roadmap, userProgress);
    }
  }, [roadmap, userProgress, createGraphData]);

  const handleTopicStart = useCallback(async (topicId: string): Promise<void> => {
    await roadmapService.addCurrentTopic(topicId);
    const updatedProgress = await roadmapService.getUserProgress();
    setUserProgress(updatedProgress);
  }, []);

  const handleTopicComplete = useCallback(async (topicId: string): Promise<void> => {
    await roadmapService.markTopicComplete(topicId);
    const updatedProgress = await roadmapService.getUserProgress();
    setUserProgress(updatedProgress);
  }, []);  useEffect(() => {
    const loadRoadmapData = async () => {
      try {
        setLoading(true);
        
        // If we have pre-loaded roadmap data, use it instead of fetching
        if (preloadedRoadmap) {          // Set current user in roadmap service
          roadmapService.setCurrentUser(userData?.uid || null);
          
          // Get user progress only
          const progress = await roadmapService.getUserProgress();
          const recommendations = await roadmapService.getRecommendedNextTopics(preloadedRoadmap.category as 'frontend' | 'backend' | 'fullstack', progress);
          
          // Batch all state updates
          setRoadmap(preloadedRoadmap);
          setUserProgress(progress);
          setRecommendedTopics(recommendations);
          return;
        }
        
        // Original data loading logic for when no pre-loaded data is available
        roadmapService.setCurrentUser(userData?.uid || null);
          // Get user progress (will use Firebase if authenticated, localStorage otherwise)
        const progress = await roadmapService.getUserProgress();

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
        ).length;        currentRoadmap.overallProgress = Math.round((completedCount / totalTopics) * 100);

        // Get recommendations using async method with current progress
        const recommendations = await roadmapService.getRecommendedNextTopics(selectedCategory, progress);
        
        // Batch all state updates to prevent multiple re-renders
        setRoadmap(currentRoadmap);
        setUserProgress(progress);
        setRecommendedTopics(recommendations);
        
      } catch (error) {
        console.error('Error loading roadmap data:', error);
        // Fallback to non-authenticated mode if error occurs
        roadmapService.setCurrentUser(null);
        const fallbackProgress = {
          completedTopics: [],
          currentTopics: [],
          timeSpent: {},
          skillLevel: {}        };
        
        let currentRoadmap: LearningRoadmap;
        if (preloadedRoadmap) {
          currentRoadmap = preloadedRoadmap;
        } else {
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
        }
        
        // Batch fallback state updates
        setRoadmap(currentRoadmap);
        setUserProgress(fallbackProgress);
        setRecommendedTopics([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoadmapData();
  }, [selectedCategory, userData?.uid, preloadedRoadmap]);  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-300 shadow-sm';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 shadow-sm';
    }
  };const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend': return <Globe className="h-5 w-5" />;
      case 'backend': return <Database className="h-5 w-5" />;
      case 'fullstack': return <Code className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  // Generate analytics data
  const getAnalyticsData = () => {
    if (!roadmap || !userProgress) return null;

    const categoryData: { [key: string]: number } = {};
    const difficultyData: { [key: string]: { completed: number; total: number } } = {
      beginner: { completed: 0, total: 0 },
      intermediate: { completed: 0, total: 0 },
      advanced: { completed: 0, total: 0 }
    };

    roadmap.nodes.forEach(node => {
      const topic = node.topic;
      const isCompleted = userProgress.completedTopics.includes(topic.id);
      
      // Category distribution
      categoryData[topic.category] = (categoryData[topic.category] || 0) + 1;
      
      // Difficulty analysis
      difficultyData[topic.difficulty].total++;
      if (isCompleted) {
        difficultyData[topic.difficulty].completed++;
      }
    });

    // Progress over time (simulated data)
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toLocaleDateString(),
        progress: Math.max(0, roadmap.overallProgress - (i * 5))
      });
    }

    return {
      progressOverTime: dates,
      categoryDistribution: Object.entries(categoryData).map(([name, value]) => ({
        name,
        value
      })),
      difficultyBreakdown: Object.entries(difficultyData).map(([name, data]) => ({
        name,
        completed: data.completed,
        total: data.total,
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }))
    };
  };

  const analyticsData = getAnalyticsData();

  const exportRoadmap = () => {
    if (!roadmap) return;
    
    const exportData = {
      roadmap: roadmap.title,
      category: selectedCategory,
      progress: roadmap.overallProgress,
      completedTopics: userProgress?.completedTopics || [],
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCategory}-roadmap-progress.json`;
    a.click();
    URL.revokeObjectURL(url);
  };  if (loading || !roadmap || !userProgress) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="h-32 bg-muted rounded-lg"></div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          
          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {preloadedRoadmap ? roadmap.title : 'Enhanced Learning Roadmaps'}
              </CardTitle>
              <CardDescription>
                {preloadedRoadmap 
                  ? roadmap.description 
                  : 'Choose your learning path and track your progress with advanced visualizations'
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportRoadmap}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">            {/* Category Selection - Only show for curated roadmaps */}
            {!preloadedRoadmap && (
              <Tabs 
                value={selectedCategory} 
                onValueChange={(value) => setSelectedCategory(value as 'frontend' | 'backend' | 'fullstack')} 
                className="flex-1"
              >
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
              </Tabs>
            )}            
            {/* View Mode Selection */}            <Tabs 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as 'list' | 'graph' | 'analytics')}
              className={preloadedRoadmap ? "flex-1" : ""}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="graph" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Graph
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Overall Progress</span>
            </div>
            <div className="space-y-2">
              <Progress value={roadmap.overallProgress} className="h-2" />
              <p className="text-2xl font-bold">{roadmap.overallProgress}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold">
              {userProgress.completedTopics.filter(topicId => 
                roadmap.nodes.some(node => node.topic.id === topicId)
              ).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{userProgress.currentTopics.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-2xl font-bold">{roadmap.estimatedDuration}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Based on View Mode */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Recommended Next Topics */}
          {recommendedTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Recommended Next Steps
                </CardTitle>
                <CardDescription>
                  Based on your progress, here are your next learning opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedTopics.map((topic) => (
                    <Card 
                      key={topic.id} 
                      className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                              {topic.title}
                            </CardTitle>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`px-2 py-1 font-semibold ${getDifficultyColor(topic.difficulty)}`}
                          >
                            {topic.difficulty}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm leading-relaxed text-gray-600">
                          {topic.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">{topic.estimatedHours}h</span>
                            </span>
                            <Badge 
                              variant="secondary" 
                              className="bg-slate-100 text-slate-700 border-slate-200 px-2 py-1"
                            >
                              {topic.category}
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300" 
                            onClick={() => handleTopicStart(topic.id)}
                            disabled={userProgress.currentTopics.includes(topic.id)}
                          >
                            {userProgress.currentTopics.includes(topic.id) ? (
                              <>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                In Progress
                              </>
                            ) : (
                              <>
                                <Target className="h-4 w-4 mr-2" />
                                Start Learning
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Path List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedCategory)}
                {roadmap.title}
              </CardTitle>
              <CardDescription>{roadmap.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roadmap.nodes.map((node, index) => {
                  const topic = node.topic;
                  const isCompleted = userProgress.completedTopics.includes(topic.id);
                  const isInProgress = userProgress.currentTopics.includes(topic.id);
                  const canStart = topic.prerequisites.every(prereq => 
                    userProgress.completedTopics.includes(prereq)
                  );

                  return (
                    <div key={topic.id} className="relative">                      {/* Enhanced Connection Line */}
                      {index < roadmap.nodes.length - 1 && (
                        <div className="absolute left-7 top-20 w-1 h-8 bg-gradient-to-b from-blue-300 to-blue-400 rounded-full shadow-sm"></div>
                      )}
                        <div className={`group relative flex items-start gap-4 p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                        isCompleted 
                          ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-100 hover:border-emerald-400 hover:shadow-emerald-100' 
                          : isInProgress 
                          ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-100 hover:border-blue-400 hover:shadow-blue-100'
                          : canStart
                          ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 hover:border-orange-400 hover:shadow-orange-100 cursor-pointer'
                          : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-100 opacity-75'
                      }`}>
                        {/* Status Icon with enhanced styling */}
                        <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white group-hover:scale-105' 
                            : isInProgress
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-105'
                            : canStart
                            ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white group-hover:scale-105'
                            : 'bg-gradient-to-br from-gray-400 to-slate-500 text-white'
                        }`}>
                          {/* Completion indicator */}
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}                          {isCompleted ? (
                            <Award className="h-7 w-7" />
                          ) : isInProgress ? (
                            <PlayCircle className="h-7 w-7" />
                          ) : canStart ? (
                            <Target className="h-7 w-7" />
                          ) : (
                            <BookOpen className="h-7 w-7" />
                          )}
                        </div>                        {/* Topic Content with enhanced styling */}
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-grow min-w-0 pr-4">
                              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                                {topic.title}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                {isCompleted && (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-1 text-xs font-medium">
                                    ✓ Completed
                                  </Badge>
                                )}
                                {isInProgress && (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1 text-xs font-medium">
                                    🎯 In Progress
                                  </Badge>
                                )}
                                {canStart && !isInProgress && !isCompleted && (
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-2 py-1 text-xs font-medium">
                                    🚀 Ready to Start
                                  </Badge>
                                )}
                                {!canStart && !isInProgress && !isCompleted && (
                                  <Badge className="bg-gray-100 text-gray-600 border-gray-200 px-2 py-1 text-xs font-medium">
                                    🔒 Locked
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              <Badge 
                                variant="outline" 
                                className={`px-3 py-1 font-semibold transition-colors ${getDifficultyColor(topic.difficulty)}`}
                              >
                                {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className="bg-slate-100 text-slate-700 border-slate-200 px-2 py-1 text-xs"
                              >
                                {topic.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                            {topic.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{topic.estimatedHours} hours</span>
                            </span>
                            <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                              <BookOpen className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{topic.resources.length} resources</span>
                            </span>
                          </div>                          {/* Enhanced Progress Bar */}
                          {(isCompleted || isInProgress) && (
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-600">Progress</span>
                                <span className="text-xs font-bold text-gray-800">{Math.round(topic.progress || 0)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-2.5 rounded-full transition-all duration-500 ${
                                    isCompleted 
                                      ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                  }`}
                                  style={{ width: `${topic.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Enhanced Action Buttons */}
                          <div className="flex gap-3">
                            {!isCompleted && canStart && (
                              <Button 
                                size="sm" 
                                className={`font-semibold transition-all duration-300 ${
                                  isInProgress 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl' 
                                    : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                                onClick={() => isInProgress ? handleTopicComplete(topic.id) : handleTopicStart(topic.id)}
                              >
                                {isInProgress ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Start Learning
                                  </>
                                )}
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="font-medium border-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                              onClick={() => router.push(`/learning/resources/${topic.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Resources
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'graph' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Interactive Learning Path
            </CardTitle>
            <CardDescription>
              Visualize your learning journey with connections and dependencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '600px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="top-right"
              >
                <MiniMap />
                <Controls />
                <Background variant={BackgroundVariant.Dots} />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'analytics' && analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Topics by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analyticsData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Difficulty Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Progress by Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.difficultyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" />
                  <Bar dataKey="total" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Achievement Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Achievement Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.difficultyBreakdown.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.completed}/{item.total} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>        </div>
      )}
    </div>
  );
};

export default EnhancedLearningRoadmapComponent;
