import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RestrictionBanner } from "@/components/shared/RestrictionBanner";
import { TimerLogic } from "@/components/focus/TimerLogic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <TimerLogic />
            <Navbar />
            <div className="flex pt-16">
                <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-background pt-16 md:flex">
                    <Sidebar />
                </aside>
                <main className="flex-1 px-4 py-8 md:ml-64 lg:px-8">
                    <RestrictionBanner />
                    {children}
                </main>
            </div>
        </div>
    );
}
