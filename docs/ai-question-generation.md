# AI Question Generation Feature

This document explains how to use the new AI-powered question generation feature that generates 50 interview questions using Gemini AI.

## Overview

The question generation feature allows users to automatically generate interview questions based on:
- **Field**: IT, Computer Science, Languages, or Other
- **Type**: Frontend, Backend, Full Stack, DevOps, or Other  
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Count**: Number of questions to generate (default: 50)

Each generated question has:
- `qid`: A unique crypto-generated UUID
- `question`: The question text

## API Endpoints

### Generate Questions
**Endpoint**: `POST /api/gemini`
**Action**: `generateQuestions`

```typescript
// Request body
{
  action: 'generateQuestions',
  data: {
    field: 'it' | 'cs' | 'lg' | 'other',
    type: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'other',
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    customType?: string, // Required when field is 'other'
    count?: number // Default: 50
  }
}

// Response
QuestionItem[] = [
  {
    qid: string, // crypto.randomUUID()
    question: string
  }
]
```

## Usage Examples

### 1. Basic Usage with GeminiService

```typescript
import { geminiService } from '@/service/GeminiService';

const questions = await geminiService.generateQuestions({
  field: 'it',
  type: 'frontend',
  difficulty: 'intermediate',
  count: 50
});

console.log(questions);
// Output: [{ qid: "uuid", question: "Explain React hooks..." }, ...]
```

### 2. Using the Utility Functions

```typescript
import { generateInterviewQuestions } from '@/utils/questionGenerator';

const questions = await generateInterviewQuestions({
  field: 'cs',
  type: 'backend',
  difficulty: 'advanced',
  count: 25
});

// Questions are ready to use in InterviewType format
```

### 3. Converting for InterviewType

```typescript
import { convertQuestionsToInterviewFormat } from '@/utils/questionGenerator';

const questions = await generateInterviewQuestions(params);
const formattedQuestions = convertQuestionsToInterviewFormat(questions);

// Use in interview creation
const interview: Partial<InterviewType> = {
  // ...other fields
  questions: formattedQuestions
};
```

## Integration in Interview Creation

The feature is integrated into the interview creation form at `/interview/create`. Users can:

1. Fill out basic interview details (title, field, type, difficulty)
2. Click "Generate Questions" to create AI-powered questions
3. Preview the generated questions
4. Save the interview with questions included

### UI Flow

```typescript
// State management
const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([]);
const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

// Generate questions
const handleGenerateQuestions = async () => {
  const formData = form.getValues();
  const questions = await generateInterviewQuestions({
    field: formData.field,
    type: formData.type,
    difficulty: formData.difficulty,
    count: 50
  });
  setGeneratedQuestions(questions);
};

// Include in interview
const interview: Partial<InterviewType> = {
  // ...other fields
  questions: generatedQuestions.length > 0 
    ? convertQuestionsToInterviewFormat(generatedQuestions)
    : undefined
};
```

## Demo Page

Visit `/test-questions` to see a live demo of the question generation feature. This page allows you to:

- Configure generation parameters
- Generate questions in real-time
- Preview the question format
- See the JSON structure

## Question Format

Generated questions follow the InterviewType interface format:

```typescript
// InterviewType.questions format
questions?: Array<{
  qid: string;    // crypto.randomUUID()
  question: string;
}>;
```

## Error Handling

The system includes comprehensive error handling:

1. **API Errors**: Falls back to generated sample questions
2. **Validation Errors**: Checks required parameters before generation
3. **Network Errors**: Provides user-friendly error messages

```typescript
try {
  const questions = await generateInterviewQuestions(params);
} catch (error) {
  console.error('Generation failed:', error);
  // Handle error appropriately
}
```

## Utility Functions

The `questionGenerator.ts` utility provides helpful functions:

- `generateInterviewQuestions()`: Main generation function
- `convertQuestionsToInterviewFormat()`: Format for InterviewType
- `formatQuestionsForDisplay()`: Format for UI display
- `getQuestionSubset()`: Get a random subset of questions
- `validateQuestionParams()`: Validate generation parameters

## Configuration

### Environment Variables

Ensure you have the Gemini API key configured:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Supported Parameters

- **Fields**: `it`, `cs`, `lg`, `other`
- **Types**: `frontend`, `backend`, `fullstack`, `devops`, `other`
- **Difficulties**: `beginner`, `intermediate`, `advanced`
- **Count**: 1-100 questions (default: 50)

## Best Practices

1. **Validation**: Always validate parameters before generation
2. **Error Handling**: Implement proper error handling for API calls
3. **Caching**: Consider caching generated questions for reuse
4. **User Feedback**: Show loading states and progress indicators
5. **Preview**: Allow users to preview questions before saving

## Example Implementation

Here's a complete example of integrating question generation:

```typescript
import { useState } from 'react';
import { generateInterviewQuestions, convertQuestionsToInterviewFormat } from '@/utils/questionGenerator';

function InterviewCreation() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await generateInterviewQuestions({
        field: 'it',
        type: 'frontend',
        difficulty: 'intermediate',
        count: 50
      });
      setQuestions(generated);
    } catch (error) {
      alert('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const interview = {
      // ...other fields
      questions: convertQuestionsToInterviewFormat(questions)
    };
    // Save interview
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {questions.length > 0 && (
        <div>
          <p>{questions.length} questions generated</p>
          <button onClick={handleSave}>Save Interview</button>
        </div>
      )}
    </div>
  );
}
```

This feature significantly enhances the interview preparation experience by providing high-quality, relevant questions tailored to specific roles and difficulty levels.
