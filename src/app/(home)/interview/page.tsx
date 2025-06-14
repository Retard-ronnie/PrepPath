"use client"

import Link from "next/link"

import { PlusCircle, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { getAllUserInterview } from "@/actions/FirebaseUserApi"
import { useAuth } from "@/hooks/useAuth"
import InterviewListLoading from "./loading"
import { isSuccess } from "@/utils/isSuccess"
import UserInterviewCard from "@/components/interview/UserInterviewCard"

export default function InterviewListPage() {
  // const router = useRouter()
  const { userData } = useAuth()

  const { data: response, isLoading, error } = useQuery(
    {
      queryKey: ['interviews', userData?.uid],
      queryFn: async () => {
        if (!userData?.uid) throw new Error('No UID Found')

        return getAllUserInterview(userData?.uid)
      },
      enabled: !!userData?.uid // Ensuring query only runs when UID is available
    }
  )

  if (isLoading) return <InterviewListLoading />

  if (error) return <p>Error loading interviews: {error.message}</p>;

  if (!response) {
    return <p>Something Went wrong</p>
  }
  if (!isSuccess(response)) {
    return <p>Error: {'error' in response && response.error.message || "unknown error"}</p>
  }

  const interviews = response.data ?? []

  console.log('Data',interviews)

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Interviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage your scheduled mock interviews
          </p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link href="/interview/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Schedule New Interview
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading interviews...</p>
          </div>
        </div>
      ) : interviews.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <CalendarDays className="h-12 w-12 text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No interviews scheduled</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You haven&apos;t scheduled any mock interviews yet. Create your first interview to start practicing.
                </p>
              </div>
              <Button asChild className="mt-4">
                <Link href="/interview/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Schedule Your First Interview
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {interviews.map((interview) => (
            <UserInterviewCard
              key={interview.id}
              interview={{
                ...interview,
                customType: interview.customType || undefined,
                createdAt: interview.createdAt, // Fallback for missing createdAt
                completedAt: interview.completedAt, // Pass completedAt field
              }}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}
