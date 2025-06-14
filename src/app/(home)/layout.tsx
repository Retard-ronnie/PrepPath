import { Navbar } from "@/components/common/Navbar";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata: Metadata = {
    title: 'Home Page',
    description: 'Home page of the applications'
}

export default function HomeLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ProtectedRoute>
            <>
                <Navbar />
                <Suspense fallback={<Loading />}>
                    {children}
                </Suspense>
            </>
        </ProtectedRoute>
    )
}