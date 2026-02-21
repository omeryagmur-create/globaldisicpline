import { SupabaseClient } from '@supabase/supabase-js';
import { StudyPlan, DailyTask } from '@/types/user';
import { logger } from '@/lib/logger';
import { AnalyticsService } from './AnalyticsService';

export interface CreatePlanTask {
    task_date: string;
    subject: string;
    topic: string;
    estimated_duration: number;
}

export interface CreateStudyPlanData {
    examDate: string;
    totalWeeks: number;
    subjects: string[];
    dailyHours: number;
    tasks: CreatePlanTask[];
}

export class PlannerService {
    static async getStudyPlans(supabase: SupabaseClient, userId: string): Promise<StudyPlan[]> {
        const { data, error } = await supabase
            .from('study_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching study plans', error, { userId });
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
            logger.error('Error fetching daily tasks', error, { userId, date });
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
            logger.error('Error fetching tasks by plan', error, { planId });
            throw error;
        }

        return data as DailyTask[];
    }

    static async createStudyPlan(supabase: SupabaseClient, userId: string, data: CreateStudyPlanData): Promise<void> {
        try {
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
                logger.error('Failed to create study plan row', error, { userId });
                throw new Error(error?.message || "Failed to create plan");
            }

            // Create tasks
            const tasks = data.tasks.map((task: CreatePlanTask) => ({
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
                logger.error('Failed to insert daily tasks for plan', tasksError, { userId, planId: plan.id });
                throw new Error(tasksError.message);
            }

            // Track analytics
            AnalyticsService.trackEvent('PLAN_CREATE', {
                userId,
                examDate: data.examDate,
                taskCount: tasks.length
            });

        } catch (error) {
            logger.error('Exception in createStudyPlan', error, { userId });
            throw error;
        }
    }

    static async updateTask(supabase: SupabaseClient, taskId: string, updates: Partial<DailyTask>): Promise<void> {
        const { error } = await supabase
            .from('daily_tasks')
            .update(updates)
            .eq('id', taskId);

        if (error) {
            logger.error('Error updating daily task', error, { taskId });
            throw error;
        }

        if (updates.is_completed) {
            AnalyticsService.trackEvent('TASK_COMPLETE', { taskId });
        }
    }
}
