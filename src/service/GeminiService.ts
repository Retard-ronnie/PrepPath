export interface ProfileSummary {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface InterviewSuggestion {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'frontend' | 'backend' | 'fullstack' | 'devops';
  focus: string[];
  estimatedDuration: number;
}

export interface InterviewData {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  completedAt?: string;
  score?: number;
  status?: string;
}

export interface AnswerData {
  questionId: string;
  text: string;
}

export interface QuestionData {
  id: string;
  text: string;
}

export interface PerformanceData {
  score?: number;
  timeSpent?: number;
  accuracy?: number;
}

export interface QuestionItem {
  qid: string;
  question: string;
}

export interface GenerateQuestionsParams {
  field: "it" | "cs" | "lg" | "other";
  type: "frontend" | "backend" | "fullstack" | "devops" | "other";
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  customType?: string;
  count?: number; // Default to 50
}

export class GeminiService {
  private apiEndpoint = '/api/gemini';
  /**
   * Generate a profile summary based on user's interview history and performance
   */
  async generateProfileSummary(userProfile: {
    interviews: InterviewData[];
    answers: AnswerData[];
    completedInterviews: number;
    averageScore?: number;
    preferredTopics?: string;
    experience?: string;
  }): Promise<ProfileSummary> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateProfileSummary',
          data: userProfile,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to generate profile summary');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating profile summary:', error);
      // Return fallback data
      return {
        summary: 'Developing technical interview skills with consistent practice and improvement.',
        strengths: ['Problem-solving approach', 'Technical curiosity', 'Learning mindset'],
        areasForImprovement: ['Algorithm optimization', 'System design concepts', 'Communication clarity'],
        recommendations: [
          'Practice data structures and algorithms daily',
          'Study system design fundamentals',
          'Improve technical communication skills'
        ],
        skillLevel: 'intermediate'
      };
    }
  }
  /**
   * Generate personalized interview suggestions based on user's profile and history
   */
  async generateInterviewSuggestions(userProfile: {
    skillLevel: string;
    weakAreas: string[];
    preferredTopics: string[];
    recentInterviews: InterviewData[];
  }): Promise<InterviewSuggestion[]> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateInterviewSuggestions',
          data: userProfile,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to generate interview suggestions');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating interview suggestions:', error);
      // Return fallback suggestions
      return [
        {
          title: 'Frontend Fundamentals',
          description: 'Practice essential frontend concepts including HTML, CSS, and JavaScript basics.',
          difficulty: 'beginner' as const,
          type: 'frontend' as const,
          focus: ['HTML/CSS', 'JavaScript', 'DOM Manipulation'],
          estimatedDuration: 30
        },
        {
          title: 'Backend API Development',
          description: 'Focus on REST API design, database interactions, and server-side logic.',
          difficulty: 'intermediate' as const,
          type: 'backend' as const,
          focus: ['REST APIs', 'Database Design', 'Authentication'],
          estimatedDuration: 45
        },
        {
          title: 'System Design Basics',
          description: 'Learn fundamental system design concepts and architectural patterns.',
          difficulty: 'intermediate' as const,
          type: 'fullstack' as const,
          focus: ['Architecture', 'Scalability', 'Load Balancing'],
          estimatedDuration: 60
        }
      ];
    }
  }
  /**
   * Generate feedback analysis for completed interviews
   */
  async analyzeFeedback(interviewData: {
    questions: QuestionData[];
    answers: AnswerData[];
    performance: PerformanceData;
  }): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyzeFeedback',
          data: interviewData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to analyze feedback');
      }
      
      const data = await response.json();
      console.log('Generated feedback:', data);
      return data.feedback;
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return 'Thank you for completing this interview. Continue practicing to improve your technical communication and problem-solving skills.';
    }
  }
  /**
   * Generate interview questions based on parameters
   */
  async generateQuestions(params: GenerateQuestionsParams): Promise<QuestionItem[]> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateQuestions',
          data: params,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to generate questions');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating questions:', error);
      // Return fallback questions
      return this.getFallbackQuestions(params);
    }
  }

  /**
   * Get fallback questions when API fails
   */
  private getFallbackQuestions(params: GenerateQuestionsParams): QuestionItem[] {
    const count = params.count || 50;
    const questions: QuestionItem[] = [];
    
    for (let i = 1; i <= count; i++) {
      questions.push({
        qid: crypto.randomUUID(),
        question: `Sample ${params.type} question ${i} for ${params.difficulty} level: Explain the concept and provide examples.`
      });
    }
    
    return questions;
  }

  /**
   * Generate content using a direct prompt (for AI feedback analysis)
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generateContent',
          data: { prompt },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to generate content');
      }
      
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
