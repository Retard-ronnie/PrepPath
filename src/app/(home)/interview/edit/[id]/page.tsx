"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar as CalendarIcon, Check, Info } from "lucide-react"
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAInterviewDetail, Response, updateInterview } from "@/actions/FirebaseUserApi"
import { InterviewType } from "@/types/user"
import { isSuccess } from "@/utils/isSuccess"
import Loading from "@/app/loading"

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

type InterviewFormValue = FormValues

export default function EditInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = typeof params.id === 'string' ? params.id : '';
  const { userData } = useAuth();

  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState('');

  // Getting query client instance
  const queryClient = useQueryClient();

  // Early validation
  useEffect(() => {
    if (!interviewId) {
      setNotFound(true);
    }
  }, [interviewId]);

  // Fetch single interview Data
  const {
    data: interviewResponse,
    isLoading: isInterviewLoading,
    error: interviewError
  } = useQuery<Response<InterviewType>, Error>({
    queryKey: ['interview', interviewId, userData?.uid],
    queryFn: async () => {
      if (!userData?.uid || !interviewId) {
        throw new Error('User is not authenticated or Interview ID is missing');
      }
      return getAInterviewDetail(userData.uid, interviewId);
    },
    enabled: !!interviewId && !!userData?.uid,
    staleTime: 5 * 60 * 1000, // Data is okay for 5 min
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry if user is not authenticated or interview ID is missing
      if (error.message.includes('not authenticated') || error.message.includes('ID is missing')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Initialize the form with default values
  const form = useForm<InterviewFormValue>({
    resolver: zodResolver(formSchema),    // initial values
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
  });

  const selectedField = form.watch("field")
  const availableTypes = typeOptions[selectedField as keyof typeof typeOptions] || []// Load the interview data
  useEffect(() => {
    // Reset form when data is successfully loaded
    if (interviewResponse && isSuccess(interviewResponse) && interviewResponse.data) {
      const interviewData = interviewResponse.data;
      
      // Set default date to tomorrow to avoid validation issues with past dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      let interviewDate = tomorrow;
      
      try {        if (interviewData.date) {
          // Handle Firebase Timestamp object with seconds and nanoseconds
          if (
            typeof interviewData.date === 'object' && 
            'seconds' in interviewData.date && 
            typeof (interviewData.date as { seconds: number }).seconds === 'number'
          ) {
            const milliseconds = (interviewData.date as { seconds: number }).seconds * 1000;
            const dateFromTimestamp = new Date(milliseconds);
            if (!isNaN(dateFromTimestamp.getTime())) {
              // Ensure the date is not in the past
              if (dateFromTimestamp > new Date()) {
                interviewDate = dateFromTimestamp;
              }
            }
          }
          // Handle number timestamp
          else if (typeof interviewData.date === 'number') {
            const dateFromNumber = new Date(interviewData.date);
            if (!isNaN(dateFromNumber.getTime())) {
              // Ensure the date is not in the past
              if (dateFromNumber > new Date()) {
                interviewDate = dateFromNumber;
              }
            }
          }
          // Handle string date
          else if (typeof interviewData.date === 'string') {
            const dateFromString = new Date(interviewData.date);
            if (!isNaN(dateFromString.getTime())) {
              // Ensure the date is not in the past
              if (dateFromString > new Date()) {
                interviewDate = dateFromString;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error parsing interview date:', error);
        // Keep the default tomorrow date
      }      form.reset({
        title: interviewData.title,
        description: interviewData.description || "",
        difficulty: interviewData.difficulty,
        field: interviewData.field,
        type: interviewData.type,
        customType: interviewData.customType || "",
        emailNotification: interviewData.emailNotification || false,
        date: interviewDate,
        notes: interviewData.notes || "",
      });
    }
  }, [interviewResponse, form]);

  // Handle error states and loading
  useEffect(() => {
    if (!isInterviewLoading && interviewError) {
      console.error('Error fetching interview:', interviewError);
      setNotFound(true);
    }
    
    if (!isInterviewLoading && interviewResponse && !isSuccess(interviewResponse)) {
      console.error('API returned error:', interviewResponse);
      setNotFound(true);
    }
    
    if (!isInterviewLoading && !interviewResponse) {
      setNotFound(true);
    }
  }, [isInterviewLoading, interviewError, interviewResponse]);  // Setup useMutation for Update
  const {
    mutate: updateInterviewMutation,
    isPending: isUpdating,
    isError: isUpdateError,
    isSuccess: isUpdateSuccess,   } = useMutation<Response<InterviewType>, Error, { updates: Partial<InterviewType>; interviewId: string }>({
    mutationFn: async ({ updates, interviewId }) => {
      if (!userData?.uid) {
        throw new Error("User not authenticated for update");
      }
      
      console.log("Submitting updates to API:", updates);
      
      const result = await updateInterview(interviewId, userData?.uid, updates);
      
      console.log("API response:", result);
      
      return result as Response<InterviewType>;
    },
    onSuccess: (data, variables) => {
      console.log("Mutation success:", data);
      
      if (isSuccess(data)) {
        // Clear any existing errors
        setErrors('');
        
        // Invalidating specific interview
        queryClient.invalidateQueries({
          queryKey: ['interview', variables.interviewId, userData?.uid]
        })

        // Invalidate the all interviews list query key
        queryClient.invalidateQueries({
          queryKey: ['interviews', userData?.uid]
        })

        setTimeout(() => {
          router.push("/interview");
        }, 1500)      } else {
        const errorData = data as { error?: { message?: string } };
        const errorMessage = errorData.error?.message || 'Unknown API error';
        console.error("API returned error:", errorMessage);
        setErrors(`Update failed: ${errorMessage}`);
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setErrors(`Error updating interview: ${error.message}`);
    }
  })// Handle form submission
  async function onSubmit(data: InterviewFormValue) {
    try {
      // Ensure date is valid before submitting
      if (!data.date || isNaN(data.date.getTime())) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        data.date = tomorrow;
      }

      // Create a sanitized object for Firebase submission
      const updatedInterview: Partial<InterviewType> = {
        title: data.title,
        description: data.description || "",
        difficulty: data.difficulty,
        field: data.field,
        type: (data.field === "other" ? "other" : data.type) as InterviewType["type"],
        customType: data.field === "other" ? data.customType : undefined,
        emailNotification: !!data.emailNotification, // Ensure boolean
        date: data.date.toISOString(), // Convert Date to ISO string
        notes: data.notes || ""
      };

      console.log("Submitting interview update:", updatedInterview);
      updateInterviewMutation({updates: updatedInterview, interviewId});
    } catch (error) {
      console.error("Error preparing interview data:", error);
      setErrors("Error preparing interview data. Please try again.");
    }
  }

  if(isInterviewLoading){
    return <Loading/>
  }



  if (notFound) {
    return (
      <div className="container py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Interview Not Found</CardTitle>            <CardDescription>
              We couldn&apos;t find the interview you&apos;re looking for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The interview may have been deleted or the ID is incorrect.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/interview")}>
              Back to Interviews
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Interview</h1>      {isUpdateSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your interview has been updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {(isUpdateError || errors) && (
        <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errors || "Failed to update interview. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Interview</CardTitle>
          <CardDescription>
            Update the details of your scheduled interview.
          </CardDescription>
        </CardHeader>        <CardContent>
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
              />

              {/* Email Notification */}
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
              />

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
              />

              {/* Footer */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/interview")}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Interview"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-start border-t">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Your interview details will be saved locally on this device.
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
