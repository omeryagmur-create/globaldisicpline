"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Navbar } from "@/components/layout/Navbar";

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

    if (!isAuthorized) {
        return null;
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
