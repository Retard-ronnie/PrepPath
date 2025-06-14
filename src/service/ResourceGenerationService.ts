// AI-powered Resource Generation Service - Pure Gemini AI Implementation
// Uses ONLY Gemini AI to generate real learning resources with NO fake/placeholder data
// Only free options - requires only GEMINI_API_KEY

export interface GeneratedResource {
  type: 'article' | 'video' | 'course' | 'practice';
  title: string;
  url: string;
  duration?: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export class ResourceGenerationService {
  private static instance: ResourceGenerationService;
  
  public static getInstance(): ResourceGenerationService {
    if (!ResourceGenerationService.instance) {
      ResourceGenerationService.instance = new ResourceGenerationService();
    }
    return ResourceGenerationService.instance;
  }

  // Main method to generate resources for a topic using only Gemini AI
  public async generateResourcesForTopic(
    topicTitle: string, 
    mainTitle: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<GeneratedResource[]> {
    try {
      console.log(`🤖 Generating AI resources for: ${topicTitle} (${difficulty})`);
      
      // Use Gemini AI to generate real resources
      const aiResources = await this.generateResourcesWithGemini(topicTitle, mainTitle, difficulty);
      
      if (!aiResources || aiResources.length === 0) {
        throw new Error('AI failed to generate any resources');
      }

      console.log(`✅ Generated ${aiResources.length} AI resources`);
      return aiResources;
    } catch (error) {
      console.error('❌ Failed to generate AI resources:', error);
      // NO FALLBACK - we don't want fake data
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate resources for ${topicTitle}: ${errorMessage}`);
    }
  }

  // Generate resources using only Gemini AI
  private async generateResourcesWithGemini(
    topicTitle: string, 
    mainTitle: string, 
    difficulty: string
  ): Promise<GeneratedResource[]> {
    try {
      const prompt = this.buildResourceGenerationPrompt(topicTitle, mainTitle, difficulty);
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'curateResources',
          data: { prompt }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const aiResponse = await response.json();
      
      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'AI response indicated failure');
      }

      return this.parseAIResponse(aiResponse.content);
      
    } catch (error) {
      console.error('Gemini AI generation failed:', error);
      throw error;
    }
  }

  // Build comprehensive prompt for Gemini AI to generate real resources
  private buildResourceGenerationPrompt(topicTitle: string, mainTitle: string, difficulty: string): string {
    return `
You are a learning resource expert. I need you to find and recommend REAL, existing learning resources for the topic "${topicTitle}" in the context of "${mainTitle}" at ${difficulty} level.

Requirements:
- Provide 5-10 REAL resources that actually exist online
- Include a mix of: courses, articles, videos, and practice exercises
- Use actual URLs from reputable platforms
- Ensure resources are appropriate for ${difficulty} level
- No fake or placeholder content

For each resource, provide:
1. type: "course", "article", "video", or "practice"
2. title: The actual title of the resource
3. url: The real URL where it can be found
4. duration: Realistic time estimate
5. description: Brief description of what it covers
6. difficulty: "${difficulty}"

Focus on these platforms for real resources:
- Courses: Udemy, Coursera, edX, freeCodeCamp, Khan Academy
- Articles: MDN, W3Schools, dev.to, Medium, official documentation
- Videos: YouTube (specific channels like Traversy Media, Academind, freeCodeCamp)
- Practice: GitHub repositories, Codepen, JSFiddle, HackerRank, LeetCode

Examples of REAL resources:
- freeCodeCamp JavaScript course: https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/
- MDN JavaScript Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- Traversy Media YouTube: https://www.youtube.com/@TraversyMedia
- JavaScript30 Challenge: https://javascript30.com/

Respond ONLY in this JSON format:
{
  "resources": [
    {
      "type": "course",
      "title": "Actual Resource Title",
      "url": "https://realurl.com/path",
      "duration": "X hours",
      "description": "What this resource teaches",
      "difficulty": "${difficulty}"
    }
  ]
}

Generate resources for: "${topicTitle}" (${difficulty} level)
`;
  }

  // Parse AI response and validate resources
  private parseAIResponse(aiContent: string): GeneratedResource[] {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      const resources = parsed.resources || [];

      // Validate each resource
      const validResources = resources.filter((resource: unknown) => {
        const res = resource as Record<string, unknown>;
        return (
          res.type && 
          res.title && 
          res.url && 
          this.isValidUrl(res.url as string) &&
          ['course', 'article', 'video', 'practice'].includes(res.type as string)
        );
      });

      if (validResources.length === 0) {
        throw new Error('No valid resources found in AI response');
      }

      return validResources.map((resource: unknown) => {
        const res = resource as Record<string, unknown>;
        return {
          type: res.type as 'course' | 'article' | 'video' | 'practice',
          title: res.title as string,
          url: res.url as string,
          duration: (res.duration as string) || '1-2 hours',
          description: (res.description as string) || '',
          difficulty: (res.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate'
        };
      });
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid AI response format: ${errorMessage}`);
    }
  }

  // Validate URL format
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }
}

export const resourceGenerationService = ResourceGenerationService.getInstance();
