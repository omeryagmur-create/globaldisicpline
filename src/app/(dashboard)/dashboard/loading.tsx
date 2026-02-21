import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Hero Header Skeleton */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 md:p-8 h-[200px] flex flex-col justify-center space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            {/* Main Content Bento Grid Skeleton */}
            <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-5">
                    <div className="h-48 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">
                        <Skeleton className="h-full w-full" />
                    </div>
                    <div className="h-96 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">
                        <Skeleton className="h-full w-full" />
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-5">
                    <div className="h-64 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">
                        <Skeleton className="h-full w-full" />
                    </div>
                    <div className="h-80 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6">
                        <Skeleton className="h-full w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
