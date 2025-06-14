import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Define types for better type safety
interface UserProfile {
  completedInterviews?: number;
  averageScore?: number | string;
  preferredTopics?: string | string[];
  experience?: string;
  interviews?: Array<{
    title?: string;
    type?: string;
    difficulty?: string;
  }>;
  skillLevel?: string;
  weakAreas?: string[];
  recentInterviews?: Array<{
    type?: string;
  }>;
}

interface InterviewData {
  questions?: Array<{
    text?: string;
  }>;
  answers?: Array<{
    text?: string;
  }>;
}

interface QuestionParams {
  field: string;
  type: string;
  difficulty: string;
  customType?: string;
  count?: number;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    switch (action) {
      case 'generateProfileSummary':
        return await generateProfileSummary(model, data);
      case 'generateInterviewSuggestions':
        return await generateInterviewSuggestions(model, data);
      case 'analyzeFeedback':
        return await analyzeFeedback(model, data);
      case 'generateQuestions':
        return await generateQuestions(model, data);
      case 'generateContent':
        return await generateContent(model, data);
      case 'curateResources':
        return await curateResources(model, data);
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function generateProfileSummary(model: GenerativeModel, userProfile: UserProfile) {
  const prompt = `
    Analyze the following user profile and interview data to provide a comprehensive summary:

    User Profile:
    - Completed Interviews: ${userProfile.completedInterviews || 0}
    - Average Score: ${userProfile.averageScore || 'N/A'}
    - Preferred Topics: ${userProfile.preferredTopics || 'N/A'}
    - Experience Level: ${userProfile.experience || 'N/A'}    Recent Interviews:
    ${userProfile.interviews && userProfile.interviews.length > 0 ? 
      userProfile.interviews.map((interview) => `
      - ${interview.title || 'Untitled'}: ${interview.type || 'General'} (${interview.difficulty || 'Intermediate'})
    `).join('') : 'No recent interviews found.'}

    Based on this data, provide:
    1. A concise professional summary (2-3 sentences)
    2. Top 3 strengths
    3. Top 3 areas for improvement
    4. 3 specific recommendations for growth
    5. Overall skill level assessment

    Format the response as JSON with the following structure:
    {
      "summary": "Professional summary here",
      "strengths": ["strength1", "strength2", "strength3"],
      "areasForImprovement": ["area1", "area2", "area3"],
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "skillLevel": "beginner|intermediate|advanced"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0]);
      return NextResponse.json(summary);
    }
    
    throw new Error('Could not parse response');
  } catch (error) {
    console.error('Error generating profile summary:', error);
    
    // Return fallback data
    const fallbackSummary = {
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
    return NextResponse.json(fallbackSummary);
  }
}

async function generateInterviewSuggestions(model: GenerativeModel, userProfile: UserProfile) {
  const prompt = `
    Generate 3 personalized interview suggestions for a user with the following profile:

    Skill Level: ${userProfile.skillLevel || 'intermediate'}
    Areas needing improvement: ${userProfile.weakAreas && userProfile.weakAreas.length > 0 ? userProfile.weakAreas.join(', ') : 'general programming skills'}
    Preferred topics: ${userProfile.preferredTopics && Array.isArray(userProfile.preferredTopics) ? userProfile.preferredTopics.join(', ') : userProfile.preferredTopics || 'software development'}
    Recent interview types: ${userProfile.recentInterviews && userProfile.recentInterviews.length > 0 ? 
      userProfile.recentInterviews.map((i) => i.type || 'general').join(', ') : 'none'}

    For each suggestion, provide:
    1. A compelling title
    2. A brief description (1-2 sentences)
    3. Appropriate difficulty level
    4. Interview type (frontend/backend/fullstack/devops)
    5. Key focus areas (3-4 topics)
    6. Estimated duration in minutes

    Format as JSON array:
    [
      {
        "title": "Interview title",
        "description": "Brief description",
        "difficulty": "beginner|intermediate|advanced",
        "type": "frontend|backend|fullstack|devops",
        "focus": ["topic1", "topic2", "topic3"],
        "estimatedDuration": 45
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const suggestions = JSON.parse(jsonMatch[0]);
        return NextResponse.json(suggestions);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Could not parse response as JSON');
      }
    }
    
    throw new Error('Could not parse response');
  } catch (error) {
    console.error('Error generating interview suggestions:', error);
    
    // Return fallback suggestions
    const fallbackSuggestions = [
      {
        title: 'Frontend Fundamentals',
        description: 'Practice essential frontend concepts including HTML, CSS, and JavaScript basics.',
        difficulty: 'beginner',
        type: 'frontend',
        focus: ['HTML/CSS', 'JavaScript', 'DOM Manipulation'],
        estimatedDuration: 30
      },
      {
        title: 'Backend API Development',
        description: 'Focus on REST API design, database interactions, and server-side logic.',
        difficulty: 'intermediate',
        type: 'backend',
        focus: ['REST APIs', 'Database Design', 'Authentication'],
        estimatedDuration: 45
      },
      {
        title: 'System Design Basics',
        description: 'Learn fundamental system design concepts and architectural patterns.',
        difficulty: 'intermediate',
        type: 'fullstack',
        focus: ['Architecture', 'Scalability', 'Load Balancing'],
        estimatedDuration: 60
      }
    ];
    return NextResponse.json(fallbackSuggestions);
  }
}

async function analyzeFeedback(model: GenerativeModel, interviewData: InterviewData) {
  const prompt = `
    Analyze the following interview performance and provide constructive feedback:

    Questions and Answers:
    ${interviewData.questions && interviewData.questions.length > 0 ? 
      interviewData.questions.map((q, i: number) => `
        Q: ${q.text || 'No question text'}
        A: ${interviewData.answers && interviewData.answers[i]?.text || 'No answer provided'}
      `).join('\n') : 'No questions or answers provided.'}

    Provide specific, actionable feedback focusing on:
    1. Technical accuracy
    2. Communication clarity
    3. Problem-solving approach
    4. Areas for improvement
    5. Next steps for growth

    Keep the feedback encouraging and constructive.
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    const fallbackFeedback = 'Thank you for completing this interview. Continue practicing to improve your technical communication and problem-solving skills.';
    return NextResponse.json({ feedback: fallbackFeedback });
  }
}

async function generateQuestions(model: GenerativeModel, params: QuestionParams) {
  const { field, type, difficulty, customType, count = 50 } = params;
  
  const fieldMap: Record<string, string> = {
    it: 'Information Technology',
    cs: 'Computer Science',
    lg: 'Languages',
    other: customType || 'General'
  };
  
  const typeMap: Record<string, string> = {
    frontend: 'Frontend Development',
    backend: 'Backend Development', 
    fullstack: 'Full Stack Development',
    devops: 'DevOps',
    other: 'General Programming'
  };

  const prompt = `
    Generate exactly ${count} interview questions for a ${difficulty} level ${typeMap[type] || 'General'} interview in the ${fieldMap[field] || 'General'} field.

    Requirements:
    - Each question should be unique and relevant
    - Questions should be appropriate for ${difficulty} difficulty level
    - Cover different aspects of ${typeMap[type] || 'General Programming'}
    - Include both theoretical and practical questions
    - Make questions challenging but fair
    - Avoid repetitive or similar questions

    Format the response as a JSON array with this exact structure:
    [
      {
        "qid": "unique_id_1",
        "question": "Your question text here"
      },
      {
        "qid": "unique_id_2", 
        "question": "Your question text here"
      }
    ]

    Generate unique alphanumeric IDs for each question (like "q1a2b3c4").
    Ensure you return exactly ${count} questions.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const questions = JSON.parse(jsonMatch[0]);
        
        // Validate and ensure we have the right format
        if (Array.isArray(questions) && questions.length > 0) {
          // Generate crypto UUIDs for better uniqueness
          const questionsWithCryptoIds = questions.map((q, index) => ({
            qid: crypto.randomUUID(),
            question: q.question || `Question ${index + 1}: Please provide your answer.`
          }));
          
          return NextResponse.json(questionsWithCryptoIds.slice(0, count));
        }
      } catch (parseError) {
        console.error('Error parsing questions JSON:', parseError);
      }
    }
    
    throw new Error('Could not parse questions response');
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Return fallback questions
    const fallbackQuestions = Array.from({ length: count }, (_, index) => ({
      qid: crypto.randomUUID(),
      question: `${typeMap[type] || 'General'} question ${index + 1} for ${difficulty} level: Explain the concept and provide practical examples.`
    }));
    
    return NextResponse.json(fallbackQuestions);
  }
}

async function generateContent(model: GenerativeModel, data: { prompt: string }) {
  try {
    const { prompt } = data;
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

async function curateResources(model: GenerativeModel, data: { prompt: string }) {
  try {
    const { prompt } = data;
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    return NextResponse.json({ 
      success: true,
      content: content 
    });
  } catch (error) {
    console.error('Error curating resources:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to curate resources' 
      },
      { status: 500 }
    );
  }
}
