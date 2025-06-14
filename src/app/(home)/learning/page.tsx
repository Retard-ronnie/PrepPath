// filepath: c:\Users\Rahul\OneDrive\Desktop\vapiProject\Prep\preppath\src\app\(home)\learning\page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Code, 
  Database, 
  Layers, 
  Plus, 
  ArrowRight, 
  Trophy,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { roadmapService, LearningRoadmap, UserProgress } from '@/service/RoadmapService';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LearningDashboard = () => {
  const { userData } = useAuth();
  const router = useRouter();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [customRoadmaps, setCustomRoadmaps] = useState<LearningRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userData?.uid) {
        setLoading(false);
        return;
      }

      try {
        roadmapService.setCurrentUser(userData.uid);
        
        // Load user progress
        const progress = await roadmapService.getUserProgress();
        setUserProgress(progress);

        // Load custom roadmaps
        const roadmaps = await roadmapService.getCustomRoadmaps(userData.uid);
        setCustomRoadmaps(roadmaps);
      } catch (error) {
        console.error('Error loading learning data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userData?.uid]);

  const roadmapCategories = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'Master modern web development with React, TypeScript, and advanced UI/UX patterns',
      icon: <Code className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-500',
      topics: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Management'],
      estimatedTime: '12-16 weeks',
      difficulty: 'Intermediate'
    },
    {
      id: 'backend',
      title: 'Backend Development',
      description: 'Build scalable server-side applications with Node.js, databases, and cloud services',
      icon: <Database className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-500',
      topics: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'API Design'],
      estimatedTime: '14-18 weeks',
      difficulty: 'Intermediate'
    },
    {
      id: 'fullstack',
      title: 'Full-Stack Development',
      description: 'Comprehensive path covering both frontend and backend development',
      icon: <Layers className="h-8 w-8" />,
      color: 'from-purple-500 to-pink-500',
      topics: ['Full-Stack Architecture', 'DevOps', 'Testing', 'Deployment'],
      estimatedTime: '20-24 weeks',
      difficulty: 'Advanced'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Learning Roadmaps
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose your learning path and master the skills you need to advance your career
        </p>
      </div>

      {/* Progress Overview */}
      {userProgress && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <CardTitle>Your Progress</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {userProgress.completedTopics?.length || 0} topics completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userProgress.completedTopics?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Completed Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userProgress.currentTopics?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(userProgress.timeSpent || {}).length}
                </div>
                <div className="text-sm text-muted-foreground">Subjects Studied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Curated Roadmaps */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Curated Learning Paths</h2>
          <Button 
            onClick={() => router.push('/learning/create-custom')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Custom Roadmap
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapCategories.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform`}>
                  {category.icon}
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{category.estimatedTime}</span>
                  </div>
                  <Badge className={getDifficultyColor(category.difficulty)}>
                    {category.difficulty}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {category.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {category.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{category.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Link href={`/learning/roadmap/${category.id}`} className="block">
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Start Learning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Roadmaps */}
      {customRoadmaps.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Custom Roadmaps</h2>
            <Button 
              variant="outline"
              onClick={() => router.push('/learning/create-custom')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Another
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customRoadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                    <Target className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{roadmap.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {roadmap.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{roadmap.estimatedDuration}</span>
                    </div>
                    <Badge className={getDifficultyColor(roadmap.targetLevel || 'intermediate')}>
                      {roadmap.targetLevel?.replace('-', ' ') || 'Custom'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Progress:</div>
                    <div className="space-y-1">
                      <Progress value={roadmap.overallProgress || 0} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {roadmap.overallProgress || 0}% Complete
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/learning/roadmap/${roadmap.id}`} className="block">
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Continue Learning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {(!userProgress || userProgress.completedTopics?.length === 0) && (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Start Learning?</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Choose a roadmap that matches your goals and current skill level. 
              Each path is designed to take you from beginner to expert.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/learning/create-custom')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Custom Path
              </Button>
              <Button variant="outline" onClick={() => {
                document.querySelector('#frontend')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Browse Roadmaps
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningDashboard;