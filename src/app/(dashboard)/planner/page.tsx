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

    // Fetch active plan with its tasks in one go using Supabase relationship join
    const { data: plan, error } = await supabase
        .from('study_plans')
        .select(`
            *,
            daily_tasks:daily_tasks(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('task_date', { referencedTable: 'daily_tasks', ascending: true })
        .single();

    if (error || !plan) {
        return { plan: null, tasks: [] };
    }

    // Cast because Supabase types might not know about the join automatically here
    const tasks = (plan as any).daily_tasks || [];

    return { plan, tasks };
}

export default async function PlannerPage() {
    const { plan, tasks } = await getPlannerData();

    return <PlannerContent plan={plan} tasks={tasks} />;
}
