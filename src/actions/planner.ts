"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PlannerService } from "@/services/PlannerService";

export async function createStudyPlan(data: { examDate: string, totalWeeks: number, subjects: string[], dailyHours: number, tasks: { task_date: string, subject: string, topic: string, estimated_duration: number }[] }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    await PlannerService.createStudyPlan(supabase, user.id, data);

    revalidatePath("/planner");
}

export async function updateTask(taskId: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    await PlannerService.updateTask(supabase, taskId, {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
    });

    revalidatePath("/planner");
}
