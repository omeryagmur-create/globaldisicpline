import { PlannerSetup } from "@/components/planner/PlannerSetup";
import { PlannerView } from "@/components/planner/PlannerView";
import { createStudyPlan, updateTask } from "@/actions/planner";
import { createClient } from "@/lib/supabase/server";
import { BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Study Planner - Global Discipline Engine",
    description: "Plan your study schedule and track your progress.",
};

async function getPlannerData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { plan: null, tasks: [] };

    const { data: plan } = await supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

    if (!plan) return { plan: null, tasks: [] };

    const { data: tasks } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("plan_id", plan.id)
        .order("task_date", { ascending: true });

    return { plan, tasks: tasks || [] };
}

export default async function PlannerPage() {
    const { plan, tasks } = await getPlannerData();

    if (!plan) {
        return (
            <div className="container mx-auto max-w-4xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Create a personalized study plan to stay on track for your exams.
                    </p>
                </div>
                <PlannerSetup onCreatePlan={createStudyPlan} />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl space-y-8">
            <PlannerView
                plan={plan}
                tasks={tasks}
                onToggleTask={updateTask}
            />
        </div>
    );
}
