"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  X, 
  Target, 
  Clock, 
  BookOpen, 
  Sparkles,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { roadmapService, CustomRoadmapForm as CustomRoadmapFormType, LearningRoadmap } from '@/service/RoadmapService';
import { useAuth } from '@/hooks/useAuth';

interface CustomRoadmapFormProps {
  onRoadmapCreated?: (roadmap: LearningRoadmap) => void;
  onCancel?: () => void;
}

const CustomRoadmapForm: React.FC<CustomRoadmapFormProps> = ({ 
  onRoadmapCreated, 
  onCancel 
}) => {
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<CustomRoadmapFormType>({
    title: '',
    description: '',
    goal: '',
    topics: '',
    targetLevel: 'medium-level',
    timeInvestment: 10,
    includeLearningMaterials: true,
    category: 'Custom Learning Path'
  });

  // Local state for managing multiple topics in the UI
  const [topicsList, setTopicsList] = useState<string[]>(['']);
  const handleAddTopic = () => {
    setTopicsList(prev => [...prev, '']);
  };

  const handleRemoveTopic = (index: number) => {
    if (topicsList.length > 1) {
      setTopicsList(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleTopicChange = (index: number, value: string) => {
    setTopicsList(prev => prev.map((topic, i) => i === index ? value : topic));
    // Update the combined topics string for the form data
    const updatedTopics = topicsList.map((topic, i) => i === index ? value : topic);
    setFormData(prev => ({ 
      ...prev, 
      topics: updatedTopics.filter(t => t.trim()).join('. ') 
    }));
  };
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.description?.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!formData.goal.trim()) {
      setError('Goal is required');
      return false;
    }
    
    if (topicsList.some(topic => !topic.trim())) {
      setError('All topics must have descriptions');
      return false;
    }
    
    if (formData.timeInvestment < 1 || formData.timeInvestment > 50) {
      setError('Time investment must be between 1-50 hours per week');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.uid) {
      setError('You must be logged in to create a custom roadmap');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);    try {
      // Set current user in roadmap service
      roadmapService.setCurrentUser(userData.uid);
      
      // Combine topics into a single string for the service
      const cleanedFormData = {
        ...formData,
        topics: topicsList.filter(topic => topic.trim()).join('. ')
      };
      
      const roadmap = await roadmapService.createCustomRoadmap(cleanedFormData);
      
      setSuccess(true);
      
      // Call callback if provided
      if (onRoadmapCreated) {
        onRoadmapCreated(roadmap);
      }
        // Reset form
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          goal: '',
          topics: '',
          targetLevel: 'medium-level',
          timeInvestment: 10,
          includeLearningMaterials: true,
          category: 'Custom Learning Path'
        });
        setTopicsList(['']);
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error creating custom roadmap:', err);
      setError('Failed to create custom roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const calculateEstimatedTime = () => {
    const topicCount = topicsList.filter(topic => topic.trim()).length;
    const baseHours = formData.targetLevel === 'zero-to-advanced' ? 35 : 
                     formData.targetLevel === 'medium-level' ? 25 : 20;
    const totalHours = topicCount * baseHours;
    const weeks = Math.ceil(totalHours / formData.timeInvestment);
    return { totalHours, weeks };
  };

  const { totalHours, weeks } = calculateEstimatedTime();

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-800">Roadmap Created Successfully!</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your custom learning roadmap has been created and saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={() => setSuccess(false)}
              variant="outline"
              className="border-green-200"
            >
              Create Another
            </Button>
            {onCancel && (
              <Button onClick={onCancel} className="bg-green-600 hover:bg-green-700">
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <CardTitle>Create Custom Learning Roadmap</CardTitle>
          </div>
          <CardDescription>
            Design a personalized learning path tailored to your goals and schedule
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Roadmap Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Full Stack Web Development"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Web Development, Data Science"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this roadmap covers and who it's for..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">What do you want to achieve? *</Label>
              <Textarea
                id="goal"
                placeholder="Describe your learning goals and what you want to accomplish..."
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Learning Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="targetLevel">Target Level *</Label>                <Select
                  value={formData.targetLevel}
                  onValueChange={(value: 'zero-to-advanced' | 'medium-level' | 'advanced-level') => 
                    setFormData(prev => ({ ...prev, targetLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zero-to-advanced">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>Zero to Advanced - Complete journey</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium-level">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-yellow-500" />
                        <span>Medium Level - Some experience</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced-level">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-red-500" />
                        <span>Advanced Level - Deep specialization</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeInvestment">
                  Time Investment (hours per week) *
                </Label>
                <Input
                  id="timeInvestment"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.timeInvestment}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    timeInvestment: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                  }))}
                />
              </div>
            </div>

            {/* Learning Resources Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <Label htmlFor="includeResources" className="text-sm font-medium">
                  Include Learning Resources
                </Label>
                <p className="text-xs text-gray-600">
                  Automatically generate links to courses, articles, and practice materials
                </p>
              </div>              <Switch
                id="includeResources"
                checked={formData.includeLearningMaterials}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, includeLearningMaterials: checked }))
                }
              />
            </div>

            {/* Topics Section */}
            <div className="space-y-4">              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">
                  Learning Topics * ({topicsList.filter(t => t.trim()).length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTopic}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Topic</span>
                </Button>
              </div>
              
              <div className="space-y-3">
                {topicsList.map((topic, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Describe what you want to learn in detail..."
                        value={topic}
                        onChange={(e) => handleTopicChange(index, e.target.value)}
                        rows={2}
                        className="w-full"
                      />
                    </div>
                    {topicsList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTopic(index)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Time Display */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800">Estimated Timeline</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Learning Time</p>
                  <p className="font-semibold text-blue-700">{totalHours} hours</p>
                </div>
                <div>
                  <p className="text-gray-600">Completion Time</p>
                  <p className="font-semibold text-blue-700">{weeks} weeks</p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Creating Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Custom Roadmap
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomRoadmapForm;
