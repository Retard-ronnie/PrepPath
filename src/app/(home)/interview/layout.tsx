"use client"

import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>

      {children}

    </ProtectedRoute>
  )
}
