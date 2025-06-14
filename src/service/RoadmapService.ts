// filepath: src/service/RoadmapService.ts
export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  prerequisites: string[];
  category: string;
  resources: {
    type: 'article' | 'video' | 'course' | 'practice';
    title: string;
    url: string;
    duration?: string;
  }[];
  completed: boolean;
  progress: number; // 0-100
}

export interface RoadmapNode {
  id: string;
  topic: LearningTopic;
  position: { x: number; y: number };
  type: 'start' | 'topic' | 'milestone' | 'end';
  connections: string[];
}

export interface LearningRoadmap {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'mobile' | 'data-science' | 'custom';
  estimatedDuration: string;
  nodes: RoadmapNode[];
  overallProgress: number;
  recommendedPath: string[];
  // New fields for custom roadmaps
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
  targetLevel?: 'zero-to-advanced' | 'medium-level' | 'advanced-level';
  timeInvestment?: number; // hours per week
  includeResources?: boolean;
  goal?: string;
}

export interface UserProgress {
  completedTopics: string[];
  currentTopics: string[];
  timeSpent: Record<string, number>; // topic_id -> hours
  skillLevel: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  lastUpdated?: number; // timestamp
  userId?: string; // Firebase user ID
}

// New interface for custom roadmap creation
export interface CustomRoadmapForm {
  title: string;
  topics: string; // Detailed topic description
  targetLevel: 'zero-to-advanced' | 'medium-level' | 'advanced-level';
  timeInvestment: number; // hours per week
  includeLearningMaterials: boolean;
  goal: string; // What they want to achieve
  description?: string;
  category?: string;
}

// Firebase imports for data persistence
import { db } from '@/service/Firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ResourceGenerationService} from './ResourceGenerationService';

export class RoadmapService {
  private static instance: RoadmapService;
  private currentUserId: string | null = null;
  
  public static getInstance(): RoadmapService {
    if (!RoadmapService.instance) {
      RoadmapService.instance = new RoadmapService();
    }
    return RoadmapService.instance;
  }

  // Initialize with current user
  public setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
  }
  public async getFrontendRoadmap(): Promise<LearningRoadmap> {
    const topics: LearningTopic[] = [      {
        id: 'html-basics',
        title: 'HTML Fundamentals',
        description: 'Learn the building blocks of web pages',
        difficulty: 'beginner',
        estimatedHours: 20,
        prerequisites: [],
        category: 'Fundamentals',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },      {
        id: 'css-basics',
        title: 'CSS Fundamentals',
        description: 'Style your web pages with CSS',
        difficulty: 'beginner',
        estimatedHours: 30,
        prerequisites: ['html-basics'],
        category: 'Fundamentals',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'javascript-basics',
        title: 'JavaScript Fundamentals',
        description: 'Add interactivity to your web pages',
        difficulty: 'beginner',
        estimatedHours: 40,
        prerequisites: ['html-basics', 'css-basics'],
        category: 'Programming',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'dom-manipulation',
        title: 'DOM Manipulation',
        description: 'Learn to interact with HTML elements using JavaScript',
        difficulty: 'intermediate',
        estimatedHours: 25,
        prerequisites: ['javascript-basics'],
        category: 'Programming',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'react-basics',
        title: 'React Fundamentals',
        description: 'Build dynamic user interfaces with React',
        difficulty: 'intermediate',
        estimatedHours: 50,
        prerequisites: ['javascript-basics', 'dom-manipulation'],
        category: 'Framework',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'react-hooks',
        title: 'React Hooks',
        description: 'Master useState, useEffect, and custom hooks',
        difficulty: 'intermediate',
        estimatedHours: 30,
        prerequisites: ['react-basics'],
        category: 'Framework',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'state-management',
        title: 'State Management',
        description: 'Learn Redux, Zustand, or Context API for state management',
        difficulty: 'advanced',
        estimatedHours: 35,
        prerequisites: ['react-hooks'],
        category: 'Advanced',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'testing',
        title: 'Frontend Testing',
        description: 'Write unit and integration tests for your React apps',
        difficulty: 'advanced',
        estimatedHours: 40,
        prerequisites: ['react-hooks'],
        category: 'Testing',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'performance',
        title: 'Performance Optimization',
        description: 'Optimize your React applications for better performance',
        difficulty: 'advanced',
        estimatedHours: 30,
        prerequisites: ['state-management'],
        category: 'Optimization',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      }
    ];

    const nodes: RoadmapNode[] = [
      { id: 'start', topic: topics[0], position: { x: 250, y: 0 }, type: 'start', connections: ['html-basics'] },
      { id: 'html-basics', topic: topics[0], position: { x: 250, y: 100 }, type: 'topic', connections: ['css-basics'] },
      { id: 'css-basics', topic: topics[1], position: { x: 250, y: 200 }, type: 'topic', connections: ['javascript-basics'] },
      { id: 'javascript-basics', topic: topics[2], position: { x: 250, y: 300 }, type: 'milestone', connections: ['dom-manipulation'] },
      { id: 'dom-manipulation', topic: topics[3], position: { x: 250, y: 400 }, type: 'topic', connections: ['react-basics'] },
      { id: 'react-basics', topic: topics[4], position: { x: 250, y: 500 }, type: 'milestone', connections: ['react-hooks'] },
      { id: 'react-hooks', topic: topics[5], position: { x: 250, y: 600 }, type: 'topic', connections: ['state-management', 'testing'] },
      { id: 'state-management', topic: topics[6], position: { x: 150, y: 700 }, type: 'topic', connections: ['performance'] },
      { id: 'testing', topic: topics[7], position: { x: 350, y: 700 }, type: 'topic', connections: ['performance'] },
      { id: 'performance', topic: topics[8], position: { x: 250, y: 800 }, type: 'end', connections: [] }
    ];

    return {
      id: 'frontend-roadmap',
      title: 'Frontend Development Roadmap',
      description: 'Complete path to becoming a frontend developer',
      category: 'frontend',
      estimatedDuration: '6-8 months',
      nodes,
      overallProgress: 0,
      recommendedPath: ['html-basics', 'css-basics', 'javascript-basics', 'dom-manipulation', 'react-basics', 'react-hooks', 'state-management', 'testing', 'performance']
    };
  }
  public async getBackendRoadmap(): Promise<LearningRoadmap> {
    const topics: LearningTopic[] = [
      {
        id: 'programming-fundamentals',
        title: 'Programming Fundamentals',
        description: 'Learn basic programming concepts and choose a language',
        difficulty: 'beginner',
        estimatedHours: 40,
        prerequisites: [],
        category: 'Fundamentals',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'server-concepts',
        title: 'Server & HTTP Concepts',
        description: 'Understand how servers and HTTP protocol work',
        difficulty: 'beginner',
        estimatedHours: 25,
        prerequisites: ['programming-fundamentals'],
        category: 'Concepts',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'node-express',
        title: 'Node.js & Express',
        description: 'Build web servers with Node.js and Express framework',
        difficulty: 'intermediate',
        estimatedHours: 45,
        prerequisites: ['server-concepts'],
        category: 'Framework',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'databases',
        title: 'Database Management',
        description: 'Learn SQL and NoSQL databases',
        difficulty: 'intermediate',
        estimatedHours: 50,
        prerequisites: ['node-express'],
        category: 'Database',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'api-design',
        title: 'API Design & Development',
        description: 'Create RESTful APIs and understand API best practices',
        difficulty: 'intermediate',
        estimatedHours: 35,
        prerequisites: ['databases'],
        category: 'API',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'authentication',
        title: 'Authentication & Security',
        description: 'Implement user authentication and security best practices',
        difficulty: 'advanced',
        estimatedHours: 40,
        prerequisites: ['api-design'],
        category: 'Security',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'testing-backend',
        title: 'Backend Testing',
        description: 'Write unit, integration, and API tests',
        difficulty: 'advanced',
        estimatedHours: 35,
        prerequisites: ['authentication'],
        category: 'Testing',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'deployment',
        title: 'Deployment & DevOps',
        description: 'Deploy applications and understand DevOps basics',
        difficulty: 'advanced',
        estimatedHours: 45,
        prerequisites: ['testing-backend'],
        category: 'DevOps',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      }
    ];

    const nodes: RoadmapNode[] = [
      { id: 'start', topic: topics[0], position: { x: 250, y: 0 }, type: 'start', connections: ['programming-fundamentals'] },
      { id: 'programming-fundamentals', topic: topics[0], position: { x: 250, y: 100 }, type: 'topic', connections: ['server-concepts'] },
      { id: 'server-concepts', topic: topics[1], position: { x: 250, y: 200 }, type: 'topic', connections: ['node-express'] },
      { id: 'node-express', topic: topics[2], position: { x: 250, y: 300 }, type: 'milestone', connections: ['databases'] },
      { id: 'databases', topic: topics[3], position: { x: 250, y: 400 }, type: 'topic', connections: ['api-design'] },
      { id: 'api-design', topic: topics[4], position: { x: 250, y: 500 }, type: 'milestone', connections: ['authentication'] },
      { id: 'authentication', topic: topics[5], position: { x: 250, y: 600 }, type: 'topic', connections: ['testing-backend'] },
      { id: 'testing-backend', topic: topics[6], position: { x: 250, y: 700 }, type: 'topic', connections: ['deployment'] },
      { id: 'deployment', topic: topics[7], position: { x: 250, y: 800 }, type: 'end', connections: [] }
    ];

    return {
      id: 'backend-roadmap',
      title: 'Backend Development Roadmap',
      description: 'Complete path to becoming a backend developer',
      category: 'backend',
      estimatedDuration: '5-7 months',
      nodes,
      overallProgress: 0,
      recommendedPath: ['programming-fundamentals', 'server-concepts', 'node-express', 'databases', 'api-design', 'authentication', 'testing-backend', 'deployment']
    };
  }
  public async getFullstackRoadmap(): Promise<LearningRoadmap> {
    // Create a unique set of topics for fullstack development
    const topics: LearningTopic[] = [
      {
        id: 'web-fundamentals',
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript basics',
        difficulty: 'beginner',
        estimatedHours: 60,
        prerequisites: [],
        category: 'Fundamentals',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'frontend-framework',
        title: 'Frontend Framework (React)',
        description: 'Build interactive user interfaces with React',
        difficulty: 'intermediate',
        estimatedHours: 50,
        prerequisites: ['web-fundamentals'],
        category: 'Frontend',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'backend-basics',
        title: 'Backend Development',
        description: 'Learn server-side programming with Node.js',
        difficulty: 'intermediate',
        estimatedHours: 45,
        prerequisites: ['web-fundamentals'],
        category: 'Backend',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'database-management',
        title: 'Database Management',
        description: 'Work with SQL and NoSQL databases',
        difficulty: 'intermediate',
        estimatedHours: 40,
        prerequisites: ['backend-basics'],
        category: 'Database',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'api-development',
        title: 'API Development',
        description: 'Create and consume RESTful APIs',
        difficulty: 'intermediate',
        estimatedHours: 35,
        prerequisites: ['database-management'],
        category: 'API',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'fullstack-integration',
        title: 'Full Stack Integration',
        description: 'Connect frontend and backend applications',
        difficulty: 'advanced',
        estimatedHours: 40,
        prerequisites: ['frontend-framework', 'api-development'],
        category: 'Integration',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0      },
      {
        id: 'auth-security',
        title: 'Authentication & Security',
        description: 'Implement user authentication and security',
        difficulty: 'advanced',
        estimatedHours: 35,
        prerequisites: ['fullstack-integration'],
        category: 'Security',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      },
      {
        id: 'testing-deployment',
        title: 'Testing & Deployment',
        description: 'Test and deploy full stack applications',
        difficulty: 'advanced',
        estimatedHours: 45,
        prerequisites: ['auth-security'],
        category: 'DevOps',
        resources: [], // Resources will be generated dynamically via AI
        completed: false,
        progress: 0
      }
    ];

    const nodes: RoadmapNode[] = [
      { id: 'start-fullstack', topic: topics[0], position: { x: 250, y: 0 }, type: 'start', connections: ['web-fundamentals'] },
      { id: 'web-fundamentals', topic: topics[0], position: { x: 250, y: 100 }, type: 'topic', connections: ['frontend-framework', 'backend-basics'] },
      { id: 'frontend-framework', topic: topics[1], position: { x: 150, y: 200 }, type: 'topic', connections: ['fullstack-integration'] },
      { id: 'backend-basics', topic: topics[2], position: { x: 350, y: 200 }, type: 'topic', connections: ['database-management'] },
      { id: 'database-management', topic: topics[3], position: { x: 350, y: 300 }, type: 'topic', connections: ['api-development'] },
      { id: 'api-development', topic: topics[4], position: { x: 350, y: 400 }, type: 'milestone', connections: ['fullstack-integration'] },
      { id: 'fullstack-integration', topic: topics[5], position: { x: 250, y: 500 }, type: 'milestone', connections: ['auth-security'] },
      { id: 'auth-security', topic: topics[6], position: { x: 250, y: 600 }, type: 'topic', connections: ['testing-deployment'] },
      { id: 'testing-deployment', topic: topics[7], position: { x: 250, y: 700 }, type: 'end', connections: [] }
    ];

    return {
      id: 'fullstack-roadmap',
      title: 'Full Stack Development Roadmap',
      description: 'Complete path to becoming a full stack developer',
      category: 'fullstack',
      estimatedDuration: '8-10 months',
      nodes,
      overallProgress: 0,
      recommendedPath: [
        'web-fundamentals', 'frontend-framework', 'backend-basics',
        'database-management', 'api-development', 'fullstack-integration',
        'auth-security', 'testing-deployment'
      ]
    };
  }

  // User progress methods - Updated to save under user's document
  private async getUserProgressFromFirestore(userId: string): Promise<UserProgress | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.learningProgress || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user progress from Firestore:', error);
      return null;
    }
  }

  private async setUserProgressToFirestore(userId: string, progress: UserProgress): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        learningProgress: {
          userId,
          ...progress,
          lastUpdated: Date.now()
        },
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error setting user progress to Firestore:', error);
    }
  }

  private async updateUserProgressInFirestore(userId: string, progress: Partial<UserProgress>): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      const currentUserDoc = await getDoc(docRef);
      const currentProgress = currentUserDoc.exists() ? currentUserDoc.data().learningProgress || {} : {};
      
      await updateDoc(docRef, {
        learningProgress: {
          ...currentProgress,
          ...progress,
          lastUpdated: Date.now()
        },
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating user progress in Firestore:', error);
    }
  }

  public async getUserProgress(): Promise<UserProgress> {
    if (!this.currentUserId) {
      // Return default progress if not authenticated
      return {
        completedTopics: [],
        currentTopics: [],
        timeSpent: {},
        skillLevel: {},
        lastUpdated: Date.now()
      };
    }

    const progress = await this.getUserProgressFromFirestore(this.currentUserId);
    if (progress) {
      return progress;
    } else {
      // Create a new progress record if not exists
      const newUserProgress: UserProgress = {
        userId: this.currentUserId,
        completedTopics: [],
        currentTopics: [],
        timeSpent: {},
        skillLevel: {},
        lastUpdated: Date.now()
      };
      await this.setUserProgressToFirestore(this.currentUserId, newUserProgress);
      return newUserProgress;
    }
  }

  public async updateUserProgress(progress: UserProgress): Promise<void> {
    if (!this.currentUserId) {
      console.warn('Cannot update progress: User not authenticated');
      return;
    }
    await this.setUserProgressToFirestore(this.currentUserId, progress);
  }

  public async markTopicComplete(topicId: string): Promise<void> {
    const progress = await this.getUserProgress();
    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
      progress.currentTopics = progress.currentTopics.filter(id => id !== topicId);
      progress.lastUpdated = Date.now();
      await this.updateUserProgress(progress);
    }
  }

  public async addCurrentTopic(topicId: string): Promise<void> {
    const progress = await this.getUserProgress();
    if (!progress.currentTopics.includes(topicId) && !progress.completedTopics.includes(topicId)) {
      progress.currentTopics.push(topicId);
      progress.lastUpdated = Date.now();
      await this.updateUserProgress(progress);
    }
  }
  // Get recommended next topics based on current progress
  public async getRecommendedNextTopics(category: 'frontend' | 'backend' | 'fullstack' | 'custom', progress: UserProgress): Promise<LearningTopic[]> {
    let roadmap: LearningRoadmap;
    
    switch (category) {
      case 'frontend':
        roadmap = await this.getFrontendRoadmap();
        break;
      case 'backend':
        roadmap = await this.getBackendRoadmap();
        break;
      case 'fullstack':
        roadmap = await this.getFullstackRoadmap();
        break;
      case 'custom':
        // For custom roadmaps, return empty array for now
        return [];
      default:
        return [];
    }

    const availableTopics = roadmap.nodes
      .filter(node => {
        const topic = node.topic;
        // Check if topic is not completed and prerequisites are met
        const isCompleted = progress.completedTopics.includes(topic.id);
        const prerequisitesMet = topic.prerequisites.every(prereq => 
          progress.completedTopics.includes(prereq)
        );
        return !isCompleted && prerequisitesMet;
      })
      .map(node => node.topic)
      .slice(0, 3); // Return top 3 recommendations

    return availableTopics;
  }

  // Custom roadmap methods - Updated to save under user's document
  public async createCustomRoadmap(formData: CustomRoadmapForm): Promise<LearningRoadmap> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }    const roadmapId = `custom-${Date.now()}-${this.currentUserId}`;
      // Generate topics from the form data
    const topics = await this.generateTopicsFromForm(formData, roadmapId);
    
    // Create nodes with proper positioning
    const nodes = this.createNodesFromTopics(topics);
    
    // Calculate estimated duration based on time investment
    const totalHours = topics.reduce((sum, topic) => sum + topic.estimatedHours, 0);
    const estimatedWeeks = Math.ceil(totalHours / formData.timeInvestment);
    const estimatedDuration = `${estimatedWeeks} weeks`;

    const customRoadmap: LearningRoadmap = {
      id: roadmapId,
      title: formData.title,
      description: formData.description || `Custom learning roadmap for ${formData.title}`,
      category: 'custom',
      estimatedDuration,
      nodes,
      overallProgress: 0,
      recommendedPath: topics.map(topic => topic.id),
      isCustom: true,
      createdBy: this.currentUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      targetLevel: formData.targetLevel,
      timeInvestment: formData.timeInvestment,
      includeResources: formData.includeLearningMaterials,
      goal: formData.goal
    };

    // Save to Firebase under user's document
    await this.saveCustomRoadmap(customRoadmap);
    
    return customRoadmap;
  }
  private async generateTopicsFromForm(formData: CustomRoadmapForm, roadmapId: string): Promise<LearningTopic[]> {
    // Parse the topics string and create structured learning topics
    const topicCount = formData.targetLevel === 'zero-to-advanced' ? 6 : 
                      formData.targetLevel === 'medium-level' ? 4 : 3;
    
    const baseHours = formData.targetLevel === 'zero-to-advanced' ? 35 : 
                     formData.targetLevel === 'medium-level' ? 30 : 25;
    
    const topics: LearningTopic[] = [];
    
    for (let i = 0; i < topicCount; i++) {
      const topicId = `${roadmapId}-topic-${i + 1}`;
      
      let title = '';
      let description = '';
      let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
      
      // Generate topic structure based on progression
      if (i === 0) {
        title = 'Foundation & Basics';
        description = `Learn the fundamental concepts of ${formData.title}`;
        difficulty = 'beginner';
      } else if (i === topicCount - 1) {
        title = 'Advanced Applications';
        description = `Master advanced concepts and real-world applications`;
        difficulty = 'advanced';
      } else {
        title = `Intermediate Skills ${i}`;
        description = `Build practical skills and deepen understanding`;
        difficulty = 'intermediate';
      }
      
      // Estimate hours based on position and level
      const progressionMultiplier = 1 + (i * 0.3);
      const estimatedHours = Math.round(baseHours * progressionMultiplier);
      
      const topic: LearningTopic = {
        id: topicId,
        title,
        description,
        difficulty,
        estimatedHours,
        prerequisites: i === 0 ? [] : [`${roadmapId}-topic-${i}`],
        category: formData.category || 'Custom',
        resources: formData.includeLearningMaterials ? await this.generateResourcesForTopicInternal(title, formData.title) : [],
        completed: false,
        progress: 0
      };
      
      topics.push(topic);
    }
    
    return topics;
  }private async generateResourcesForTopicInternal(topicTitle: string, mainTitle: string) {
    try {
      // Use AI-powered resource generation
      const resourceGenerator = ResourceGenerationService.getInstance();
      const aiResources = await resourceGenerator.generateResourcesForTopic(
        topicTitle, 
        mainTitle, 
        'intermediate' // Default difficulty, could be made configurable
      );

      // Convert AI resources to our format
      return aiResources.map(resource => ({
        type: resource.type as 'article' | 'video' | 'course' | 'practice',
        title: resource.title,
        url: resource.url,
        duration: resource.duration || '2-4 hours'
      }));
    } catch (error) {
      console.error('❌ AI resource generation failed:', error);
      
      // NO FALLBACK - we don't want fake data
      throw new Error(`Failed to generate real resources for ${topicTitle}. Please check your GEMINI_API_KEY and try again.`);
    }
  }
  // NO FALLBACK RESOURCES - We don't want fake data
  // All resources are generated by AI only

  private createNodesFromTopics(topics: LearningTopic[]): RoadmapNode[] {
    const nodes: RoadmapNode[] = [];
    const nodeSpacing = 150; // vertical spacing between nodes
    
    topics.forEach((topic, index) => {
      const nodeId = topic.id;
      const nodeType = index === 0 ? 'start' : 
                      index === topics.length - 1 ? 'end' : 
                      index % 3 === 0 ? 'milestone' : 'topic';
      
      const connections = index < topics.length - 1 ? [topics[index + 1].id] : [];

      nodes.push({
        id: nodeId,
        topic,
        position: { x: 250, y: index * nodeSpacing + 100 },
        type: nodeType,
        connections
      });
    });

    return nodes;
  }  // Save custom roadmaps as a separate collection alongside interviews
  private async saveCustomRoadmap(roadmap: LearningRoadmap): Promise<void> {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated');
      }

      const roadmapDocRef = doc(db, 'custom-roadmaps', roadmap.id);
      
      // Check if document already exists to preserve createdAt timestamp
      const existingDoc = await getDoc(roadmapDocRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : null;
      
      await setDoc(roadmapDocRef, {
        ...roadmap,
        createdAt: existingData?.createdAt || Date.now(), // Preserve existing createdAt or set new one
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error saving custom roadmap:', error);
      throw error;
    }
  }// Fetch custom roadmaps from the custom-roadmaps collection
  public async getCustomRoadmaps(userId: string): Promise<LearningRoadmap[]> {
    try {
      const roadmapsQuery = query(
        collection(db, 'custom-roadmaps'),
        where('createdBy', '==', userId)
      );
      const querySnapshot = await getDocs(roadmapsQuery);
      
      const roadmaps: LearningRoadmap[] = [];
      querySnapshot.forEach((doc) => {
        const roadmapData = doc.data() as LearningRoadmap;
        // Ensure the document ID is included in the roadmap data
        roadmaps.push({
          ...roadmapData,
          id: doc.id
        });
      });
      
      return roadmaps;
    } catch (error) {
      console.error('Error fetching custom roadmaps:', error);
      throw error;
    }
  }  // Get specific custom roadmap from the custom-roadmaps collection
  public async getCustomRoadmap(userId: string, roadmapId: string): Promise<LearningRoadmap | null> {
    try {
      const docRef = doc(db, 'custom-roadmaps', roadmapId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const roadmapData = docSnap.data() as LearningRoadmap;
        // Ensure the roadmap belongs to the requesting user
        if (roadmapData.createdBy === userId) {
          return {
            ...roadmapData,
            id: docSnap.id
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching custom roadmap:', error);
      throw error;
    }
  }
  public async deleteCustomRoadmap(roadmapId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const roadmapDocRef = doc(db, 'custom-roadmaps', roadmapId);
      const roadmapDoc = await getDoc(roadmapDocRef);
        if (roadmapDoc.exists()) {
        const roadmap = roadmapDoc.data() as LearningRoadmap;
        // Ensure the roadmap belongs to the current user
        if (roadmap.createdBy === this.currentUserId) {
          await deleteDoc(roadmapDocRef);
        } else {
          throw new Error('Unauthorized to delete this roadmap');
        }
      }
    } catch (error) {
      console.error('Error deleting custom roadmap:', error);
      throw error;
    }
  }

  // Public method for generating resources for a specific topic
  public async generateResourcesForTopic(topicTitle: string, roadmapTitle?: string): Promise<void> {
    try {
      console.log(`🔍 Generating resources for topic: ${topicTitle}`);
      
      // Find the topic in all roadmaps
      let targetTopic: LearningTopic | null = null;
      let mainTitle = roadmapTitle || 'Learning';

      // Check frontend roadmap
      const frontendRoadmap = await this.getFrontendRoadmap();
      let topicFound = frontendRoadmap.nodes.find(node => node.topic.id === topicTitle || node.topic.title === topicTitle);
      if (topicFound) {
        targetTopic = topicFound.topic;
        mainTitle = 'Frontend Development';
      }

      // Check backend roadmap if not found
      if (!targetTopic) {
        const backendRoadmap = await this.getBackendRoadmap();
        topicFound = backendRoadmap.nodes.find(node => node.topic.id === topicTitle || node.topic.title === topicTitle);
        if (topicFound) {
          targetTopic = topicFound.topic;
          mainTitle = 'Backend Development';
        }
      }

      // Check fullstack roadmap if not found
      if (!targetTopic) {
        const fullstackRoadmap = await this.getFullstackRoadmap();
        topicFound = fullstackRoadmap.nodes.find(node => node.topic.id === topicTitle || node.topic.title === topicTitle);
        if (topicFound) {
          targetTopic = topicFound.topic;
          mainTitle = 'Full Stack Development';
        }
      }

      if (!targetTopic) {
        console.warn(`⚠️ Topic not found: ${topicTitle}`);
        return;
      }      // Generate resources if topic has empty resources
      if (targetTopic.resources.length === 0) {
        console.log(`🤖 Generating AI resources for: ${targetTopic.title}`);
        const aiResources = await this.generateResourcesForTopicInternal(targetTopic.title, mainTitle);
        targetTopic.resources = aiResources;
        console.log(`✅ Generated ${aiResources.length} resources for ${targetTopic.title}`);
      } else {
        console.log(`📚 Topic already has ${targetTopic.resources.length} resources`);
      }
    } catch (error) {
      console.error('❌ Failed to generate resources:', error);
      throw error;
    }
  }
}

export const roadmapService = RoadmapService.getInstance();
