"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar as CalendarIcon, Check, Info, Sparkles } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"
import { createInterview } from "@/actions/FirebaseUserApi"
import { InterviewType } from "@/types/user"
import { generateInterviewQuestions, convertQuestionsToInterviewFormat } from "@/utils/questionGenerator"
import { type QuestionItem } from "@/service/GeminiService"

// ---------------- Schema ----------------
const formSchema = z.object({
    title: z.string().min(5, { message: "Interview title must be at least 5 characters" }),
    description: z.string().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    field: z.enum(["it", "cs", "lg", "other"]),
    type: z.string().optional(),
    customType: z.string().optional(),
    emailNotification: z.boolean(),
    date: z.date({ required_error: "Please select a date for the interview" }),
    notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// ---------------- Options ----------------
const difficultyOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
]

const fieldOptions = [
    { value: "it", label: "Information Technology (IT)" },
    { value: "cs", label: "Computer Science (CS)" },
    { value: "lg", label: "Languages" },
    { value: "other", label: "Other" },
]

const typeOptions = {
    it: [
        { value: "frontend", label: "Frontend Development" },
        { value: "backend", label: "Backend Development" },
        { value: "fullstack", label: "Full Stack Development" },
        { value: "devops", label: "DevOps" },
    ],
    cs: [
        { value: "dsa", label: "Data Structures & Algorithms" },
        { value: "os", label: "Operating Systems" },
        { value: "dbms", label: "DBMS" },
        { value: "cn", label: "Computer Networks" },
    ],
    lg: [
        { value: "jp", label: "Japanese" },
        { value: "eng", label: "English" },
        { value: "ben", label: "Bengali" },
    ],
} as const

// ---------------- Component ----------------
export default function CreateInterviewPage() {    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([])
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
    const { userData } = useAuth()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            difficulty: "intermediate",
            field: "it",
            type: "fullstack",
            customType: "",
            emailNotification: false,
            date: new Date(),
            notes: "",
        },
    })

    const selectedField = form.watch("field")
    const availableTypes = typeOptions[selectedField as keyof typeof typeOptions] || []

    // Function to generate questions using AI
    const handleGenerateQuestions = async () => {
        const formData = form.getValues();
        
        // Validate required fields for question generation
        if (!formData.field || !formData.difficulty) {
            alert('Please select both field and difficulty before generating questions.');
            return;
        }
        
        if (formData.field !== 'other' && !formData.type) {
            alert('Please select interview type before generating questions.');
            return;
        }
        
        setIsGeneratingQuestions(true);
        
        try {            const questions = await generateInterviewQuestions({
                field: formData.field,
                type: (formData.type || 'other') as "frontend" | "backend" | "fullstack" | "devops" | "other",
                difficulty: formData.difficulty,
                customType: formData.customType,
                count: 50
            });
              setGeneratedQuestions(questions);
        } catch (error) {
            console.error('Failed to generate questions:', error);
            alert('Failed to generate questions. Please try again.');
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true)
        try {
          const id = `interview_${Date.now()}`;

            if (!userData?.uid) return;

            const typeValue = (data.field === "other" ? "other" : data.type || "other") as InterviewType["type"];            // Create the interview object
            const interview: Partial<InterviewType> = {
                id,
                userId: userData.uid,
                title: data.title,
                description: data.description || "",
                difficulty: data.difficulty,
                field: data.field,
                type: typeValue,
                customType: data.field === "other" ? data.customType : null,
                emailNotification: !!data.emailNotification,
                date: data.date.toLocaleDateString(),
                notes: data.notes || "",
                status: "scheduled",
                // Include generated questions if available
                questions: generatedQuestions.length > 0 
                    ? convertQuestionsToInterviewFormat(generatedQuestions) 
                    : undefined,
                createdAt: new Date(),
                updatedAt: Date.now(),
            };


            console.log('Creating interview with data:', interview);
            await createInterview(userData.uid, id, interview);

            setIsSuccess(true);
            setTimeout(() => router.push("/interview"), 1500);
        } catch (error) {
            console.error("Error saving interview:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Schedule an Interview</h1>

            {isSuccess && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                        Your interview has been scheduled successfully!
                    </AlertDescription>
                </Alert>
            )}

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create New Interview</CardTitle>
                    <CardDescription>
                        Fill out the form below to schedule a new mock interview session.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interview Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Frontend Developer Interview Practice" {...field} />
                                        </FormControl>
                                        <FormDescription>Give your interview a descriptive title</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Focus area, goals, etc." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Difficulty + Field */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Difficulty Level</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                                                    {difficultyOptions.map((opt) => (
                                                        <FormItem key={opt.value} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl><RadioGroupItem value={opt.value} /></FormControl>
                                                            <FormLabel className="font-normal">{opt.label}</FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="field"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Interview Field</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select field" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {fieldOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Type (Conditional) */}
                            {selectedField !== "other" ? (
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Interview Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Select ${selectedField} topic`} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableTypes.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="customType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custom Field</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Game Development" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Date */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Interview Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("w-full text-left", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>Select the date for your interview</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />                            {/* Email Notification */}
                            <FormField
                                control={form.control}
                                name="emailNotification"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <FormLabel>Email Notifications</FormLabel>
                                            <FormDescription>Get email reminders</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />                            {/* AI Question Generation */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                                        <Sparkles className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">AI Question Generation</label>
                                        <p className="text-sm text-muted-foreground">Generate 50 tailored interview questions using AI</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">                                    <Button
                                        type="button"
                                        onClick={handleGenerateQuestions}
                                        disabled={isGeneratingQuestions}
                                        variant="outline"
                                        size="sm"
                                        className="min-w-[120px]"
                                    >
                                        {isGeneratingQuestions ? (
                                            <>
                                                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            "Generate Questions"
                                        )}
                                    </Button>
                                    {generatedQuestions.length > 0 && (
                                        <span className="text-xs font-medium text-green-600">
                                            ✓ {generatedQuestions.length} questions ready
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Topics, URLs, preferences..." className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />                            {/* Footer */}
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>                                <Button type="submit" disabled={isSubmitting || isGeneratingQuestions}>
                                    {isGeneratingQuestions ? "Generating Questions..." : isSubmitting ? "Scheduling..." : "Schedule Interview"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="bg-muted/50 flex justify-start border-t">
                    <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        Interview details are saved locally.
                    </span>
                </CardFooter>
            </Card>
        </div>
    )
}
