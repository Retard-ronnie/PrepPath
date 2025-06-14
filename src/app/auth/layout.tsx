'use client'

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useAuth()
  const router = useRouter()

    useEffect(() => {
      if (!loading && user) {
        router.push('/')
      }
    }, [user, router, loading])

  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col items-center justify-center">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="text-2xl font-bold">PrepPath</span>
        </Link>
        
        <main className="w-full max-w-md px-4">{children}</main>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PrepPath. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
