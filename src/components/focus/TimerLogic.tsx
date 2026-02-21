"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { MissionEngine, FocusSessionRow } from "@/lib/missionEngine";

export function TimerLogic() {
    const { isRunning, timeLeft, tick, sessionType, initialTime, completeSession } = useTimerStore();
    const supabase = createClient();

    async function handleCompletion() {
        // 1. Play sound
        const audio = new Audio("/sounds/complete.mp3");
        audio.play().catch((e) => console.error("Audio play failed", e));

        // 2. Save session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const durationMinutes = Math.floor(initialTime / 60);
        const xpEarned = calculateXP(durationMinutes, sessionType);

        const { error: sessionError } = await supabase.from("focus_sessions").insert({
            user_id: user.id,
            duration_minutes: durationMinutes,
            session_type: sessionType,
            xp_earned: xpEarned,
            started_at: new Date(new Date().getTime() - initialTime * 1000).toISOString(),
            completed_at: new Date().toISOString(),
            is_completed: true,
        });

        if (sessionError) {
            console.error("[Observability] EVENT: SESSION_SAVE_FAIL", sessionError);
            toast.error("Failed to save session: " + sessionError.message);
        } else {
            toast.success(`Session complete! You earned ${xpEarned} XP.`);

            // Award XP for the session
            const { error: xpError } = await supabase.rpc("update_user_xp", {
                p_user_id: user.id,
                p_xp_amount: xpEarned,
            });

            if (xpError) {
                console.error("[Observability] EVENT: XP_RPC_FAIL | session xp", xpError);
            }

            // ─── MISSION REWARD LOGIC (delegated to MissionEngine) ────────────
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const { data: todaySessions } = await supabase
                .from("focus_sessions")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_completed", true)
                .gte("completed_at", startOfToday.toISOString());

            if (todaySessions) {
                const typedSessions = todaySessions as FocusSessionRow[];
                const totalMinutes = typedSessions
                    .filter(s => !s.session_type?.startsWith("reward_"))
                    .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

                await MissionEngine.awardMissionRewards(
                    user.id,
                    typedSessions,
                    totalMinutes,
                    () => ({ title: "Mission Accomplished!" })
                );
            }
            // ──────────────────────────────────────────────────────────────────

            // Refresh profile to update XP/Level in navbar/dashboard
            await useUserStore.getState().fetchProfile();
        }

        // 3. Complete (handles sequence progression)
        completeSession();
    }

    useEffect(() => {
        return () => {
            // On unmount or if logic stops — check if survival mode was active
            if (sessionType === "survival" && isRunning && timeLeft > 0) {
                toast.error("Survival Mode Failed! No XP earned.", { icon: "💀" });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => { tick(); }, 500);
        } else if (isRunning && timeLeft === 0) {
            handleCompletion();
        }

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, timeLeft, tick, sessionType]);

    const calculateXP = (minutes: number, type: string) => {
        let multiplier = 1;
        if (type === "deep_focus") multiplier = 1.5;
        else if (type === "survival") multiplier = 2.0;
        else if (type === "short_break") multiplier = 0;
        else if (type === "long_break") multiplier = 0;
        return Math.round(minutes * 10 * multiplier);
    };

    return null;
}
