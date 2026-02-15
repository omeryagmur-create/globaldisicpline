"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile, loading, fetchProfile } = useUserStore();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!profile && !loading) {
            fetchProfile();
        }
    }, [profile, loading, fetchProfile]);

    useEffect(() => {
        if (!loading && profile) {
            // ✅ SECURITY: Check admin status from database
            const isAdmin = profile.is_admin === true;

            if (!isAdmin) {
                // Not an admin - redirect to dashboard
                router.push("/dashboard");
            } else {
                setIsAuthorized(true);
            }
        } else if (!loading && !profile) {
            // Not logged in - redirect to login
            router.push("/login");
        }
    }, [profile, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthorized && !loading) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center space-y-4">
                <ShieldAlert className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Unauthorized Access</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    You do not have administrative privileges. If you believe this is an error, please contact support or check your database status.
                </p>
                <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="flex pt-16">
                <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-background pt-16 md:flex">
                    <AdminSidebar />
                </aside>
                <main className="flex-1 px-4 py-8 md:ml-64 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
