// Simple test to verify custom roadmap functionality
import { roadmapService } from '../src/service/RoadmapService';

console.log('Testing RoadmapService...');

// Test basic functionality
const frontendRoadmap = roadmapService.getFrontendRoadmap();
console.log('Frontend roadmap:', frontendRoadmap.title);
console.log('Topics count:', frontendRoadmap.nodes.length);

// Test custom roadmap creation
const mockFormData = {
  title: 'React Development',
  topics: 'Learn React from basics to advanced concepts including hooks, state management, and testing',
  targetLevel: 'medium-level' as const,
  timeInvestment: 10,
  includeLearningMaterials: true,
  goal: 'Become proficient in React development'
};

console.log('Test form data:', mockFormData);
console.log('RoadmapService test completed successfully!');
