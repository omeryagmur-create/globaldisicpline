"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export function TimerLogic() {
    const { isRunning, timeLeft, tick, sessionType, initialTime, reset, completeSession } = useTimerStore();
    const supabase = createClient();

    useEffect(() => {
        return () => {
            // On unmount or if logic stops - check if survival was active
            if (sessionType === 'survival' && isRunning && timeLeft > 0) {
                // This is a "failure" of survival mode
                toast.error("Survival Mode Failed! No XP earned.", {
                    icon: "💀",
                });
            }
        };
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            // Use 500ms interval for more responsiveness
            interval = setInterval(() => {
                tick();
            }, 500);
        } else if (isRunning && timeLeft === 0) {
            // Timer finished
            handleCompletion();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, tick, sessionType]);

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

                // Award XP for the session
                await supabase.rpc('update_user_xp', {
                    p_user_id: user.id,
                    p_xp_amount: xpEarned
                });

                // ─── MISSION REWARD LOGIC ──────────────────────────────────────
                // Check for daily missions
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                // Fetch today's sessions (including the one we just saved)
                const { data: todaySessions } = await supabase
                    .from("focus_sessions")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("is_completed", true)
                    .gte("completed_at", startOfToday.toISOString());

                if (todaySessions) {
                    const missionCriteriaLine = [
                        {
                            id: "1",
                            reward: 150,
                            met: todaySessions.some(s => s.session_type === 'deep_focus')
                        },
                        {
                            id: "2",
                            reward: 300,
                            met: todaySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) >= 120
                        },
                        {
                            id: "3",
                            reward: 100,
                            met: todaySessions.filter(s => !s.session_type?.startsWith('reward_')).length >= 3
                        }
                    ];

                    for (const mission of missionCriteriaLine) {
                        const missionKey = `reward_mission_${mission.id}`;
                        const alreadyAwarded = todaySessions.some(s => s.session_type === missionKey);

                        if (mission.met && !alreadyAwarded) {
                            // Insert reward record
                            await supabase.from("focus_sessions").insert({
                                user_id: user.id,
                                duration_minutes: 0,
                                session_type: missionKey,
                                xp_earned: mission.reward,
                                started_at: new Date().toISOString(),
                                completed_at: new Date().toISOString(),
                                is_completed: true,
                                notes: `Daily Mission ${mission.id} Reward`
                            });

                            // Award Mission XP
                            await supabase.rpc('update_user_xp', {
                                p_user_id: user.id,
                                p_xp_amount: mission.reward
                            });

                            toast.success(`Mission Accomplished! +${mission.reward} XP`, {
                                icon: "🏆",
                                duration: 5000
                            });
                        }
                    }
                }
                // ──────────────────────────────────────────────────────────────

                // Refresh profile to update XP/Level in navbar/dashboard
                await useUserStore.getState().fetchProfile();
            }
        }

        // 3. Complete (handles sequence progression)
        completeSession();
    };

    const calculateXP = (minutes: number, type: string) => {
        let multiplier = 1;
        if (type === 'deep_focus') multiplier = 1.5;
        if (type === 'survival') multiplier = 2.0;
        return Math.round(minutes * multiplier);
    };

    return null; // Logic only
}
