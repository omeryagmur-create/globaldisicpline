import { createClient } from "@/lib/supabase/server";
import { PlannerContent } from "@/components/planner/PlannerContent";
import { Metadata } from "next";
import { PlannerService } from "@/services/PlannerService";

export const metadata: Metadata = {
    title: "Study Planner - Global Discipline Engine",
    description: "Plan your study schedule and track your progress.",
};

async function getPlannerData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { plan: null, tasks: [] };

    const plans = await PlannerService.getStudyPlans(supabase, user.id);
    const plan = plans.find((p) => p.is_active);

    if (!plan) return { plan: null, tasks: [] };

    const tasks = await PlannerService.getTasksByPlan(supabase, plan.id);

    return { plan, tasks: tasks || [] };
}

export default async function PlannerPage() {
    const { plan, tasks } = await getPlannerData();

    return <PlannerContent plan={plan} tasks={tasks} />;
}
