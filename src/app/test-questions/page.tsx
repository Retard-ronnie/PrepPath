"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type QuestionItem, type GenerateQuestionsParams } from '@/service/GeminiService';
import { generateInterviewQuestions } from '@/utils/questionGenerator';

export default function TestQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<GenerateQuestionsParams>({
    field: 'it',
    type: 'frontend',
    difficulty: 'intermediate',
    count: 50
  });

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const result = await generateInterviewQuestions(params);
      setQuestions(result);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('Failed to generate questions. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Question Generator Demo</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Interview Questions</CardTitle>
            <CardDescription>
              Configure parameters and generate interview questions using Gemini AI. 
              Each question will have a unique crypto-generated ID (qid) and question text.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Field</label>
                <Select 
                  value={params.field} 
                  onValueChange={(value: 'it' | 'cs' | 'lg' | 'other') => 
                    setParams(prev => ({ ...prev, field: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Information Technology</SelectItem>
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="lg">Languages</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={params.type} 
                  onValueChange={(value: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'other') => 
                    setParams(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="fullstack">Full Stack</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select 
                  value={params.difficulty} 
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                    setParams(prev => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Count</label>
                <Select 
                  value={params.count?.toString()} 
                  onValueChange={(value: string) => 
                    setParams(prev => ({ ...prev, count: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="25">25 Questions</SelectItem>
                    <SelectItem value="50">50 Questions</SelectItem>
                    <SelectItem value="100">100 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={generateQuestions} disabled={loading} className="w-full">
              {loading ? 'Generating Questions...' : 'Generate Questions with AI'}
            </Button>
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Questions ({questions.length})</CardTitle>
              <CardDescription>
                AI-generated interview questions with unique crypto UUIDs as qid values.
                This matches the format expected by the InterviewType interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={question.qid} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                        qid: {question.qid}
                      </span>
                    </div>
                    <p className="text-gray-800">{question.question}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Sample Question Object Structure:</h4>
                <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`{
  "qid": "${questions[0]?.qid || 'crypto-uuid-here'}",
  "question": "${questions[0]?.question?.substring(0, 60) || 'Sample question text'}..."
}`}
                </pre>
                <p className="text-xs text-gray-600 mt-2">
                  This format matches the <code>questions</code> field in the <code>InterviewType</code> interface.
                  The <code>qid</code> is generated using <code>crypto.randomUUID()</code> for uniqueness.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {questions.length === 0 && !loading && (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-gray-500">
                Configure the parameters above and click &quot;Generate Questions&quot; to see AI-generated interview questions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
