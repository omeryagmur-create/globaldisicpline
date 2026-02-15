"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export function TimerLogic() {
    const { isRunning, timeLeft, tick, sessionType, initialTime, reset } = useTimerStore();
    const supabase = createClient();

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                tick();
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            // Timer finished
            handleCompletion();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, tick]);

    const handleCompletion = async () => {
        // 1. Play sound
        const audio = new Audio("/sounds/complete.mp3"); // Ensure this file exists or use a robust solution
        audio.play().catch((e) => console.error("Audio play failed", e));

        // 2. Save session
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const durationMinutes = Math.floor(initialTime / 60);
            const xpEarned = calculateXP(durationMinutes, sessionType);

            const { error } = await supabase.from("focus_sessions").insert({
                user_id: user.id,
                duration_minutes: durationMinutes,
                session_type: sessionType,
                xp_earned: xpEarned,
                started_at: new Date(Date.now() - initialTime * 1000).toISOString(),
                completed_at: new Date().toISOString(),
                is_completed: true,
            });

            if (error) {
                toast.error("Failed to save session: " + error.message);
            } else {
                toast.success(`Session complete! You earned ${xpEarned} XP.`);
                // Note: Trigger in DB should update user total_xp ideally, or we do it here/via RPC.
                // For now, let's assume DB trigger handles stats or we call RPC. 
                // We have `update_user_xp` function in 004_functions.sql
                await supabase.rpc('update_user_xp', {
                    p_user_id: user.id,
                    p_xp_amount: xpEarned
                });
            }
        }

        // 3. Reset
        reset(); // Or stop.
    };

    const calculateXP = (minutes: number, type: string) => {
        // Simple logic: 1 min = 1 XP. Bonus for deep work?
        let multiplier = 1;
        if (type === 'deep_work') multiplier = 1.5;
        return Math.round(minutes * multiplier);
    };

    return null; // Logic only
}
