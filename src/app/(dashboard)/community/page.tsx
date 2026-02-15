import { FriendsList } from "@/components/community/FriendsList";
import { ActivityFeed } from "@/components/community/ActivityFeed";
import { ChallengeWidget } from "@/components/community/ChallengeWidget";
import { GroupCard } from "@/components/community/GroupCard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community - Global Discipline Engine",
    description: "Connect with friends, join challenges, and study together.",
};

export default function CommunityPage() {
    return (
        <div className="container mx-auto p-4 space-y-6 max-w-7xl h-[calc(100vh-4rem)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community</h1>
                    <p className="text-muted-foreground">
                        Stay motivated by connecting with other students.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-8">
                {/* Left Column: Friends List */}
                <div className="lg:col-span-3 h-full">
                    <FriendsList />
                </div>

                {/* Middle Column: Activity Feed */}
                <div className="lg:col-span-6 h-full">
                    <ActivityFeed />
                </div>

                {/* Right Column: Groups & Challenges */}
                <div className="lg:col-span-3 space-y-6 h-full">
                    <ChallengeWidget />
                    <GroupCard />
                </div>
            </div>
        </div>
    );
}
