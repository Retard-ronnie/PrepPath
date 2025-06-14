import { geminiService } from './GeminiService';

// Types for interview feedback analysis
export interface AnswerAnalysis {
  questionId: string;
  question: string;
  userAnswer: string;
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  technicalAccuracy: number; // 0-100
  completeness: number; // 0-100
  clarity: number; // 0-100
  keywords: string[];
}

export interface AnalysisData {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  technicalAccuracy: number;
  completeness: number;
  clarity: number;
  keywords: string[];
}

export interface PerformanceSummary {
  overallScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  averageScore: number;
  timeSpent: number; // in minutes
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  performanceLevel: 'excellent' | 'good' | 'average' | 'needs-improvement';
  nextSteps: string[];
}

export interface InterviewResults {
  interviewId: string;
  userId: string;
  completedAt: Date;
  timeSpent: number;
  answers: AnswerAnalysis[];
  summary: PerformanceSummary;
  aiAnalysis: string; // Overall AI commentary
  recommendations: string[];
}

export interface FeedbackGenerationParams {
  interviewId: string;
  userId: string;
  questions: Array<{ id: string; text: string; difficulty: string }>;
  answers: Array<{ questionId: string; text: string }>;
  interviewType: string;
  difficulty: string;
  timeSpent: number;
}

class InterviewFeedbackService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  /**
   * Generate comprehensive feedback for a completed interview
   */
  async generateFeedback(params: FeedbackGenerationParams): Promise<InterviewResults> {
    try {
      console.log('Starting feedback generation for interview:', params.interviewId);
      
      // 1. Analyze individual answers
      const answerAnalyses = await this.analyzeAnswers(
        params.questions,
        params.answers,
        params.interviewType,
        params.difficulty
      );

      // 2. Generate performance summary
      const summary = this.generatePerformanceSummary(
        answerAnalyses,
        params.timeSpent,
        params.questions.length
      );

      // 3. Generate overall AI analysis
      const aiAnalysis = await this.generateOverallAnalysis(
        answerAnalyses,
        summary,
        params.interviewType
      );

      // 4. Generate recommendations
      const recommendations = this.generateRecommendations(summary, answerAnalyses);

      const results: InterviewResults = {
        interviewId: params.interviewId,
        userId: params.userId,
        completedAt: new Date(),
        timeSpent: params.timeSpent,
        answers: answerAnalyses,
        summary,
        aiAnalysis,
        recommendations
      };

      console.log('Feedback generation completed successfully');
      return results;

    } catch (error) {
      console.error('Error generating interview feedback:', error);
      throw new Error('Failed to generate interview feedback. Please try again.');
    }
  }

  /**
   * Analyze individual answers using AI
   */
  private async analyzeAnswers(
    questions: Array<{ id: string; text: string; difficulty: string }>,
    answers: Array<{ questionId: string; text: string }>,
    interviewType: string,
    difficulty: string
  ): Promise<AnswerAnalysis[]> {
    const analyses: AnswerAnalysis[] = [];

    for (const question of questions) {
      const userAnswer = answers.find(a => a.questionId === question.id);
      
      if (userAnswer && userAnswer.text.trim()) {
        try {
          const analysis = await this.analyzeIndividualAnswer(
            question,
            userAnswer.text,
            interviewType,
            difficulty
          );
          analyses.push(analysis);
        } catch (error) {
          console.error(`Error analyzing answer for question ${question.id}:`, error);
          // Create fallback analysis
          analyses.push(this.createFallbackAnalysis(question, userAnswer.text));
        }
      } else {
        // Handle unanswered questions
        analyses.push(this.createUnansweredAnalysis(question));
      }
    }

    return analyses;
  }

  /**
   * Analyze a single answer using Gemini AI
   */
  private async analyzeIndividualAnswer(
    question: { id: string; text: string; difficulty: string },
    userAnswer: string,
    interviewType: string,
    difficulty: string
  ): Promise<AnswerAnalysis> {
    const prompt = this.createAnalysisPrompt(question, userAnswer, interviewType, difficulty);
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await geminiService.generateContent(prompt);
        const analysisData = this.parseAnalysisResponse(response);
        
        return {
          questionId: question.id,
          question: question.text,
          userAnswer,
          score: analysisData.score,
          feedback: analysisData.feedback,
          strengths: analysisData.strengths,
          improvements: analysisData.improvements,
          technicalAccuracy: analysisData.technicalAccuracy,
          completeness: analysisData.completeness,
          clarity: analysisData.clarity,
          keywords: analysisData.keywords
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed for question ${question.id}:`, error);
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to analyze answer after all retries');
  }

  /**
   * Create AI prompt for answer analysis
   */
  private createAnalysisPrompt(
    question: { text: string; difficulty: string },
    userAnswer: string,
    interviewType: string,
    difficulty: string
  ): string {
    return `You are an expert technical interviewer analyzing a candidate's response to an interview question.

INTERVIEW CONTEXT:
- Position Type: ${interviewType}
- Overall Difficulty: ${difficulty}
- Question Difficulty: ${question.difficulty}
- Question: ${question.text}
- Candidate Answer: ${userAnswer}

EVALUATION CRITERIA:
Analyze the answer based on these criteria (score each 0-100):
1. Technical Accuracy: How technically correct and accurate is the answer?
2. Completeness: Does it address all parts of the question comprehensively?
3. Clarity: How well-structured, clear, and easy to understand is the explanation?

ANALYSIS REQUIREMENTS:
1. Overall Score (0-100): Weighted average of the three criteria
2. Detailed Feedback: 2-3 sentences explaining the assessment
3. Strengths: 2-3 specific positive aspects of the answer
4. Improvements: 2-3 specific, actionable suggestions for improvement
5. Keywords: Technical terms and concepts mentioned in the answer

RESPONSE FORMAT:
Return your analysis as a JSON object with this exact structure:
{
  "score": number,
  "feedback": "string",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "technicalAccuracy": number,
  "completeness": number,
  "clarity": number,
  "keywords": ["string", "string"]
}

Important: Provide constructive, specific feedback that helps the candidate improve. Focus on both technical content and communication skills.`;
  }
  /**
   * Parse the AI response and extract analysis data
   */
  private parseAnalysisResponse(response: string): AnalysisData {
    try {
      // Try to parse as JSON directly
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (typeof parsed.score === 'number' && 
            typeof parsed.feedback === 'string' &&
            Array.isArray(parsed.strengths) &&
            Array.isArray(parsed.improvements)) {
          return parsed;
        }
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw response:', response);
      
      // Return fallback structure
      return {
        score: 70,
        feedback: "Answer provided demonstrates understanding of the topic with room for improvement.",
        strengths: ["Shows basic understanding", "Attempted to address the question"],
        improvements: ["Add more technical details", "Provide specific examples"],
        technicalAccuracy: 70,
        completeness: 65,
        clarity: 75,
        keywords: []
      };
    }
  }

  /**
   * Generate overall performance summary
   */
  private generatePerformanceSummary(
    analyses: AnswerAnalysis[],
    timeSpent: number,
    totalQuestions: number
  ): PerformanceSummary {
    const answeredQuestions = analyses.filter(a => a.score > 0).length;
    const totalScore = analyses.reduce((sum, a) => sum + a.score, 0);
    const averageScore = answeredQuestions > 0 ? totalScore / answeredQuestions : 0;

    // Collect strengths and weaknesses
    const allStrengths = analyses.flatMap(a => a.strengths);
    const allImprovements = analyses.flatMap(a => a.improvements);
    
    const strengths = this.consolidatePoints(allStrengths);
    const weaknesses = this.consolidatePoints(allImprovements);

    // Generate recommended topics
    const recommendedTopics = this.generateRecommendedTopics(analyses);

    // Determine performance level
    const performanceLevel = this.determinePerformanceLevel(averageScore);

    // Generate next steps
    const nextSteps = this.generateNextSteps(performanceLevel);

    return {
      overallScore: Math.round(averageScore),
      totalQuestions,
      answeredQuestions,
      averageScore: Math.round(averageScore),
      timeSpent,
      strengths,
      weaknesses,
      recommendedTopics,
      performanceLevel,
      nextSteps
    };
  }

  /**
   * Generate overall AI analysis
   */
  private async generateOverallAnalysis(
    analyses: AnswerAnalysis[],
    summary: PerformanceSummary,
    interviewType: string
  ): Promise<string> {
    try {
      const prompt = `You are an expert technical interviewer providing an overall assessment of a candidate's interview performance.

INTERVIEW SUMMARY:
- Position Type: ${interviewType}
- Overall Score: ${summary.overallScore}/100
- Questions Answered: ${summary.answeredQuestions}/${summary.totalQuestions}
- Time Spent: ${summary.timeSpent} minutes
- Performance Level: ${summary.performanceLevel}

INDIVIDUAL QUESTION PERFORMANCE:
${analyses.map((a, i) => 
  `Question ${i + 1} (Score: ${a.score}): ${a.question}
  Answer Quality: ${a.feedback}`
).join('\n\n')}

Provide a comprehensive 3-4 sentence analysis of the candidate's overall performance, highlighting their strongest areas and the most critical areas for improvement. Focus on technical competency, problem-solving approach, and communication effectiveness.

Keep the tone professional but encouraging.`;

      const response = await geminiService.generateContent(prompt);
      return response || this.createFallbackOverallAnalysis(summary);
    } catch (error) {
      console.error('Error generating overall analysis:', error);
      return this.createFallbackOverallAnalysis(summary);
    }
  }

  /**
   * Generate recommendations based on performance
   */
  private generateRecommendations(
    summary: PerformanceSummary,
    analyses: AnswerAnalysis[]
  ): string[] {
    const recommendations: string[] = [];

    // Performance-based recommendations
    if (summary.overallScore < 60) {
      recommendations.push("Focus on strengthening fundamental concepts before attempting advanced topics");
      recommendations.push("Practice explaining technical concepts clearly and concisely");
    } else if (summary.overallScore < 80) {
      recommendations.push("Work on providing more detailed and specific examples in your answers");
      recommendations.push("Practice system design and architectural thinking");
    } else {
      recommendations.push("Continue refining your communication of complex technical concepts");
      recommendations.push("Consider mentoring others to further solidify your knowledge");
    }

    // Topic-specific recommendations
    const weakAreas = analyses.filter(a => a.score < 70);
    if (weakAreas.length > 0) {
      recommendations.push(`Review topics related to: ${weakAreas.map(a => a.keywords.join(', ')).join(', ')}`);
    }

    // Time management recommendations
    const timePerQuestion = summary.timeSpent / summary.totalQuestions;
    if (timePerQuestion < 3) {
      recommendations.push("Take more time to think through your answers and provide comprehensive responses");
    } else if (timePerQuestion > 8) {
      recommendations.push("Practice being more concise while maintaining completeness in your answers");
    }

    return recommendations;
  }

  // Helper methods
  private createFallbackAnalysis(
    question: { id: string; text: string },
    userAnswer: string
  ): AnswerAnalysis {
    const score = Math.min(Math.max(userAnswer.length / 10, 40), 80); // Simple length-based scoring
    
    return {
      questionId: question.id,
      question: question.text,
      userAnswer,
      score: Math.round(score),
      feedback: "Your answer demonstrates engagement with the question. Consider adding more technical details and specific examples.",
      strengths: ["Attempted to answer the question", "Shows basic understanding"],
      improvements: ["Add more technical depth", "Provide specific examples"],
      technicalAccuracy: Math.round(score * 0.8),
      completeness: Math.round(score * 0.9),
      clarity: Math.round(score * 1.1),
      keywords: []
    };
  }

  private createUnansweredAnalysis(question: { id: string; text: string }): AnswerAnalysis {
    return {
      questionId: question.id,
      question: question.text,
      userAnswer: "",
      score: 0,
      feedback: "This question was not answered. Consider reviewing this topic for future interviews.",
      strengths: [],
      improvements: ["Review this topic area", "Practice similar questions"],
      technicalAccuracy: 0,
      completeness: 0,
      clarity: 0,
      keywords: []
    };
  }

  private createFallbackOverallAnalysis(summary: PerformanceSummary): string {
    return `Based on your performance of ${summary.overallScore}/100, you demonstrate ${summary.performanceLevel} technical interview skills. Your strongest areas include clear communication and problem-solving approach. Focus on strengthening technical depth and providing more specific examples to improve your performance. With continued practice, you're well-positioned for success in technical interviews.`;
  }

  private consolidatePoints(points: string[]): string[] {
    // Remove duplicates and consolidate similar points
    const unique = [...new Set(points)];
    return unique.slice(0, 5); // Return top 5 points
  }

  private generateRecommendedTopics(analyses: AnswerAnalysis[]): string[] {
    const allKeywords = analyses.flatMap(a => a.keywords);
    const lowScoreAreas = analyses
      .filter(a => a.score < 70)
      .flatMap(a => a.keywords);
    
    return [...new Set([...lowScoreAreas, ...allKeywords])].slice(0, 8);
  }

  private determinePerformanceLevel(score: number): 'excellent' | 'good' | 'average' | 'needs-improvement' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'average';
    return 'needs-improvement';
  }
  private generateNextSteps(
    level: 'excellent' | 'good' | 'average' | 'needs-improvement'
  ): string[] {
    const baseSteps: Record<string, string[]> = {
      'excellent': [
        "Consider advanced system design practice",
        "Mentor others to reinforce your knowledge",
        "Prepare for senior-level technical discussions"
      ],
      'good': [
        "Practice explaining complex concepts simply",
        "Work on system design fundamentals",
        "Focus on real-world application examples"
      ],
      'average': [
        "Strengthen core technical concepts",
        "Practice coding and problem-solving daily",
        "Study common interview patterns"
      ],
      'needs-improvement': [
        "Review fundamental programming concepts",
        "Practice basic problem-solving techniques",
        "Focus on one technical area at a time"
      ]
    };

    return baseSteps[level] || baseSteps['average'];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const interviewFeedbackService = new InterviewFeedbackService();