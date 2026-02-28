import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RestrictionBanner } from "@/components/shared/RestrictionBanner";
import { TimerLogic } from "@/components/focus/TimerLogic";
import { ThemeWrapper } from "@/components/shared/ThemeWrapper";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeWrapper>
            <div className="min-h-screen text-foreground bg-background">
                {/* Background Orbs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="orb absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/8" />
                    <div className="orb absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/6" style={{ animationDelay: '3s' }} />
                    <div className="bg-grid absolute inset-0 opacity-100" />
                </div>

                <TimerLogic />
                <Navbar />

                <div className="flex pt-16">
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main Content */}
                    <main className="flex-1 px-5 py-8 md:ml-64 lg:px-8 min-h-[calc(100vh-4rem)]">
                        <RestrictionBanner />
                        {children}
                    </main>
                </div>
            </div>
        </ThemeWrapper>
    );
}
