import { createClient } from "@/lib/supabase/server";
import { PlannerContent } from "@/components/planner/PlannerContent";
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

    return <PlannerContent plan={plan} tasks={tasks} />;
}
