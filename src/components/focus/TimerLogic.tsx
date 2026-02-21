"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { FocusService } from "@/services/FocusService";

export function TimerLogic() {
    const { isRunning, timeLeft, tick, sessionType, initialTime, completeSession } = useTimerStore();
    const supabase = createClient();

    async function handleCompletion() {
        // 1. Play sound
        const audio = new Audio("/sounds/complete.mp3");
        audio.play().catch((e) => console.error("Audio play failed", e));

        // 2. Process data using Service
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const result = await FocusService.completeSession(
                supabase,
                user.id,
                initialTime,
                sessionType,
                () => ({ title: "Mission Accomplished!" })
            );

            if (result) {
                toast.success(`Session complete! You earned ${result.xpEarned} XP.`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast.error("Failed to save session: " + message);
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

    return null;
}
