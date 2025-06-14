// Test script for custom roadmap functionality
import { RoadmapService } from './src/service/RoadmapService.js';

async function testCustomRoadmapFlow() {
  console.log('🧪 Testing Custom Roadmap Flow...\n');
  
  const service = RoadmapService.getInstance();
  
  // Set a test user
  service.setCurrentUser('test-user-123');
  
  // Test form data
  const testFormData = {
    title: 'Learn React Development',
    topics: 'I want to learn React from scratch including hooks, state management, routing, and building real-world applications. I have basic JavaScript knowledge.',
    targetLevel: 'zero-to-advanced',
    timeInvestment: 10, // 10 hours per week
    includeLearningMaterials: true,
    goal: 'Become proficient in React to build modern web applications and land a frontend developer job',
    description: 'Complete React learning roadmap',
    category: 'frontend'
  };
  
  try {
    console.log('📝 Creating custom roadmap with data:', {
      title: testFormData.title,
      targetLevel: testFormData.targetLevel,
      timeInvestment: testFormData.timeInvestment,
      includeLearningMaterials: testFormData.includeLearningMaterials
    });
    
    // Test roadmap creation
    const customRoadmap = await service.createCustomRoadmap(testFormData);
    
    console.log('✅ Custom roadmap created successfully!');
    console.log('📊 Roadmap details:');
    console.log(`   - ID: ${customRoadmap.id}`);
    console.log(`   - Title: ${customRoadmap.title}`);
    console.log(`   - Category: ${customRoadmap.category}`);
    console.log(`   - Duration: ${customRoadmap.estimatedDuration}`);
    console.log(`   - Topics count: ${customRoadmap.nodes.length}`);
    console.log(`   - Target level: ${customRoadmap.targetLevel}`);
    console.log(`   - Time investment: ${customRoadmap.timeInvestment} hours/week`);
    
    console.log('\n🗺️ Generated topics:');
    customRoadmap.nodes.forEach((node, index) => {
      if (node.type === 'topic') {
        console.log(`   ${index + 1}. ${node.topic.title} (${node.topic.difficulty}, ${node.topic.estimatedHours}h)`);
        if (testFormData.includeLearningMaterials && node.topic.resources.length > 0) {
          console.log(`      Resources: ${node.topic.resources.length} items`);
        }
      }
    });
    
    // Test getting custom roadmaps
    console.log('\n📚 Testing roadmap retrieval...');
    const userRoadmaps = await service.getCustomRoadmaps('test-user-123');
    console.log(`   Found ${userRoadmaps.length} custom roadmaps`);
    
    // Test curated roadmaps
    console.log('\n🎯 Testing curated roadmaps...');
    const frontendRoadmap = service.getFrontendRoadmap();
    console.log(`   Frontend roadmap: ${frontendRoadmap.title} (${frontendRoadmap.nodes.length} topics)`);
    
    const backendRoadmap = service.getBackendRoadmap();
    console.log(`   Backend roadmap: ${backendRoadmap.title} (${backendRoadmap.nodes.length} topics)`);
    
    const fullStackRoadmap = service.getFullStackRoadmap();
    console.log(`   Full Stack roadmap: ${fullStackRoadmap.title} (${fullStackRoadmap.nodes.length} topics)`);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCustomRoadmapFlow();
