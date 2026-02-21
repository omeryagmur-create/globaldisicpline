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
            // ✅ SECURITY: Check admin status from store
            const isAdmin = profile.is_admin === true;

            if (isAdmin) {
                setIsAuthorized(true);
            } else {
                // Not an admin - redirect to dashboard
                router.push("/dashboard");
                setIsAuthorized(false);
            }
        } else if (!loading && !profile) {
            // Not logged in - redirect to login
            router.push("/login");
        }
    }, [profile, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0b0c14]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!isAuthorized && !loading) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center space-y-6 bg-[#0b0c14]">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                    <ShieldAlert className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Access Restricted</h1>
                <p className="text-white/40 text-center max-w-md text-sm font-medium">
                    You do not have administrative privileges required for this sector.
                    If you believe this is an error, please contact central command.
                </p>
                <Button
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                    onClick={() => router.push("/dashboard")}
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c14] text-white">
            <Navbar />
            <div className="flex pt-16">
                <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/5 bg-[#0b0c14] pt-16 md:flex">
                    <AdminSidebar />
                </aside>
                <main className="flex-1 px-4 py-8 md:ml-64 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
