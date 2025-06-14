import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Award, Target, BookOpen,
  Download, Share2, Mail, Star, CheckCircle, AlertCircle
} from "lucide-react";

interface FeedbackItem {
  id: string;
  question: string;
  userAnswer: string;
  feedback: string;
  score: number;
  technicalAccuracy?: number;
  completeness?: number;
  clarity?: number;
  strengths?: string[];
  improvements?: string[];
  keywords?: string[];
}

interface EnhancedFeedbackDashboardProps {
  feedbackItems: FeedbackItem[];
  overallScore: number;
  interviewData?: {
    title: string;
    duration: number;
    totalQuestions: number;
    completedAt: Date;
  };
  onExportPDF?: () => void;
  onShare?: () => void;
  onEmailResults?: () => void;
}

const EnhancedFeedbackDashboard: React.FC<EnhancedFeedbackDashboardProps> = ({
  feedbackItems,
  interviewData,
  onExportPDF,
  onShare,
  onEmailResults
}) => {
  // Calculate performance metrics
  const averageScore = feedbackItems.reduce((sum, item) => sum + item.score, 0) / feedbackItems.length;
  const averageTechnical = feedbackItems.reduce((sum, item) => sum + (item.technicalAccuracy || 0), 0) / feedbackItems.length;
  const averageCompleteness = feedbackItems.reduce((sum, item) => sum + (item.completeness || 0), 0) / feedbackItems.length;
  const averageClarity = feedbackItems.reduce((sum, item) => sum + (item.clarity || 0), 0) / feedbackItems.length;

  // Performance level calculation
  const getPerformanceLevel = (score: number) => {
    if (score >= 85) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 65) return { level: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const performance = getPerformanceLevel(averageScore);

  // Chart data preparations
  const scoreDistribution = feedbackItems.map((item, index) => ({
    question: `Q${index + 1}`,
    score: item.score,
    technical: item.technicalAccuracy || 0,
    completeness: item.completeness || 0,
    clarity: item.clarity || 0
  }));

  const skillsData = [
    { skill: 'Technical Accuracy', score: averageTechnical, fullMark: 100 },
    { skill: 'Completeness', score: averageCompleteness, fullMark: 100 },
    { skill: 'Clarity', score: averageClarity, fullMark: 100 },
    { skill: 'Overall Performance', score: averageScore, fullMark: 100 }
  ];

  const performanceBreakdown = [
    { name: 'Excellent (85+)', value: feedbackItems.filter(item => item.score >= 85).length, color: '#22c55e' },
    { name: 'Good (75-84)', value: feedbackItems.filter(item => item.score >= 75 && item.score < 85).length, color: '#3b82f6' },
    { name: 'Average (65-74)', value: feedbackItems.filter(item => item.score >= 65 && item.score < 75).length, color: '#f59e0b' },
    { name: 'Below Average (<65)', value: feedbackItems.filter(item => item.score < 65).length, color: '#ef4444' }
  ];

  // Collect all strengths and improvements
  const allStrengths = feedbackItems.flatMap(item => item.strengths || []);
  const allImprovements = feedbackItems.flatMap(item => item.improvements || []);
  const topStrengths = [...new Set(allStrengths)].slice(0, 5);
  const topImprovements = [...new Set(allImprovements)].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Results</h1>
          <p className="text-muted-foreground">
            {interviewData?.title} • Completed {interviewData?.completedAt.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={onExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={onEmailResults} variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email Results
          </Button>
          <Button onClick={onShare} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{Math.round(averageScore)}%</CardTitle>
            <CardDescription>Overall Score</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className={`${performance.bgColor} ${performance.color} border-0`}>
              {performance.level}
            </Badge>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{Math.round(averageTechnical)}%</CardTitle>
            <CardDescription>Technical Accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={averageTechnical} className="h-2" />
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{Math.round(averageCompleteness)}%</CardTitle>
            <CardDescription>Completeness</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={averageCompleteness} className="h-2" />
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{Math.round(averageClarity)}%</CardTitle>
            <CardDescription>Clarity</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={averageClarity} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Performance by Question
            </CardTitle>
            <CardDescription>
              Score breakdown for each interview question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skills Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skills Assessment
            </CardTitle>
            <CardDescription>
              Your performance across different skill areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={0} domain={[0, 100]} />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown & Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>
              Distribution of question performance levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-4">
              {performanceBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Key Strengths
            </CardTitle>
            <CardDescription>
              Areas where you performed well
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topStrengths.length > 0 ? (
                topStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete more questions to identify strengths
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <TrendingDown className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>
              Focus areas for skill development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topImprovements.length > 0 ? (
                topImprovements.map((improvement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Great job! No major improvement areas identified
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Personalized Learning Path
          </CardTitle>
          <CardDescription>
            Recommended next steps to improve your interview performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {averageTechnical < 75 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">📚 Technical Skills</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Focus on strengthening your technical foundation
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Learning
                </Button>
              </div>
            )}
            
            {averageCompleteness < 75 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">✅ Answer Completeness</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Practice providing more comprehensive answers
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Practice More
                </Button>
              </div>
            )}
            
            {averageClarity < 75 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🗣️ Communication</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Work on explaining concepts more clearly
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Communication Tips
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFeedbackDashboard;
