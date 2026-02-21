import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-64" /> {/* Title */}

            {/* Stats Overview Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Large Chart Area Skeleton */}
                <div className="col-span-4 h-[300px] rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col items-center justify-center space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-24 w-24 rounded-full" />
                </div>

                {/* Recent Activity Skeleton */}
                <div className="col-span-3 h-[300px] rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
