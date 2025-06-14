import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function InterviewPageSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Interview Header Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Question Card Skeleton */}
      <Card className="mb-6">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-11/12" />
          <Skeleton className="h-6 w-10/12" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
      
      {/* Controls Skeleton */}
      <div className="border-t pt-4 mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function InterviewFeedbackSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center mt-2">
            <Skeleton className="h-4 flex-1 mr-4" />
            <Skeleton className="h-6 w-12" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-20" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
              <div className="pl-4 border-l-2 border-muted space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32 mt-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </div>
              {index < 2 && <Skeleton className="h-px w-full mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function InterviewSummarySkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center text-sm gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
