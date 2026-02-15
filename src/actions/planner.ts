"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStudyPlan(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Deactivate existing
    await supabase
        .from("study_plans")
        .update({ is_active: false })
        .eq("user_id", user.id);

    // Create new plan
    const { data: plan, error } = await supabase
        .from("study_plans")
        .insert({
            user_id: user.id,
            exam_date: data.examDate,
            total_weeks: data.totalWeeks,
            subjects: data.subjects,
            daily_hours: data.dailyHours,
            plan_data: { generated_at: new Date().toISOString() },
            is_active: true
        })
        .select()
        .single();

    if (error || !plan) {
        throw new Error(error?.message || "Failed to create plan");
    }

    // Create tasks
    const tasks = data.tasks.map((task: any) => ({
        user_id: user.id,
        plan_id: plan.id,
        task_date: task.task_date,
        subject: task.subject,
        topic: task.topic,
        estimated_duration: task.estimated_duration,
        is_completed: false
    }));

    const { error: tasksError } = await supabase
        .from("daily_tasks")
        .insert(tasks);

    if (tasksError) {
        throw new Error(tasksError.message);
    }

    revalidatePath("/planner");
}

export async function updateTask(taskId: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("daily_tasks")
        .update({
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq("id", taskId)
        .eq("user_id", user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/planner");
}
