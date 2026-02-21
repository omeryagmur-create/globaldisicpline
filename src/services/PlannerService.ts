import { SupabaseClient } from '@supabase/supabase-js';
import { StudyPlan, DailyTask } from '@/types/user'; // Ensure these are exported from user/database types
import { Database } from '@/types/database';

export class PlannerService {
    static async getStudyPlans(supabase: SupabaseClient, userId: string): Promise<StudyPlan[]> {
        const { data, error } = await supabase
            .from('study_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching study plans:', error);
            throw error;
        }

        return data as StudyPlan[];
    }

    static async getDailyTasks(supabase: SupabaseClient, userId: string, date: string): Promise<DailyTask[]> {
        const { data, error } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', userId)
            .eq('task_date', date)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching daily tasks:', error);
            throw error;
        }

        return data as DailyTask[];
    }

    static async getTasksByPlan(supabase: SupabaseClient, planId: string): Promise<DailyTask[]> {
        const { data, error } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('plan_id', planId)
            .order('task_date', { ascending: true });

        if (error) {
            console.error('Error fetching tasks by plan:', error);
            throw error;
        }

        return data as DailyTask[];
    }

    static async createStudyPlan(supabase: SupabaseClient, userId: string, data: any): Promise<void> {
        // Deactivate existing
        await supabase
            .from("study_plans")
            .update({ is_active: false })
            .eq("user_id", userId);

        // Create new plan
        const { data: plan, error } = await supabase
            .from("study_plans")
            .insert({
                user_id: userId,
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
            user_id: userId,
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
    }

    static async updateTask(supabase: SupabaseClient, taskId: string, updates: Partial<DailyTask>): Promise<void> {
        const { error } = await supabase
            .from('daily_tasks')
            .update(updates)
            .eq('id', taskId);

        if (error) {
            console.error('Error updating daily task:', error);
            throw error;
        }
    }
}
