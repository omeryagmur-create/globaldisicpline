import { createClient } from '@/lib/supabase/client';
import { FocusSession } from '@/types/user';
import { useUserStore } from '@/stores/useUserStore';
import { toast } from 'react-hot-toast';

export interface Mission {
    id: string;
    titleKey?: string;
    descKey?: string;
    reward: number;
    progress: number;
    isCompleted: boolean;
}

export class MissionEngine {
    static getDailyMissions(todaySessions: FocusSession[], todayMinutes: number): Mission[] {
        return [
            {
                id: "1",
                reward: 150,
                progress: todaySessions.some(s => s.session_type === 'deep_focus') ? 100 : 0,
                isCompleted: todaySessions.some(s => s.session_type === 'deep_focus')
            },
            {
                id: "2",
                reward: 300,
                progress: Math.min(100, Math.round((todayMinutes / 120) * 100)),
                isCompleted: todayMinutes >= 120
            },
            {
                id: "3",
                reward: 100,
                progress: Math.min(100, Math.round((todaySessions.length / 3) * 100)),
                isCompleted: todaySessions.length >= 3
            }
        ];
    }

    static async syncDailyMissions(userId: string, getTranslations: () => { title: string }): Promise<void> {
        const supabaseClient = createClient();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const { data: allTodaySessions } = await supabaseClient
            .from("focus_sessions")
            .select("*")
            .eq("user_id", userId)
            .eq("is_completed", true)
            .gte("completed_at", startOfToday.toISOString());

        if (!allTodaySessions) return;

        const missionData = [
            { id: "1", reward: 150, met: allTodaySessions.some(s => s.session_type === 'deep_focus') },
            { id: "2", reward: 300, met: allTodaySessions.reduce((acc, s) => acc + (s.session_type?.startsWith('reward_') ? 0 : (s.duration_minutes || 0)), 0) >= 120 },
            { id: "3", reward: 100, met: allTodaySessions.filter(s => !s.session_type?.startsWith('reward_')).length >= 3 }
        ];

        for (const mission of missionData) {
            const missionKey = `reward_mission_${mission.id}`;
            const alreadyAwarded = allTodaySessions.some(s => s.session_type === missionKey);

            if (mission.met && !alreadyAwarded) {
                try {
                    const { error: insertError } = await supabaseClient.from("focus_sessions").insert({
                        user_id: userId,
                        duration_minutes: 0,
                        session_type: missionKey,
                        xp_earned: mission.reward,
                        started_at: new Date().toISOString(),
                        completed_at: new Date().toISOString(),
                        is_completed: true,
                        notes: `Daily Mission ${mission.id} Sync Reward`
                    });

                    if (insertError) {
                        console.error(`[Observability] EVENT: MISSION_AWARD_FAIL | Error inserting reward session for mission ${mission.id}:`, insertError);
                        continue;
                    }

                    const { error: rpcError } = await supabaseClient.rpc('update_user_xp', {
                        p_user_id: userId,
                        p_xp_amount: mission.reward
                    });

                    if (rpcError) {
                        console.error(`[Observability] EVENT: XP_RPC_FAIL | Error updating XP via RPC for mission ${mission.id}:`, rpcError);
                        continue;
                    }

                    const t = getTranslations();
                    toast.success(`${t.title}: +${mission.reward} XP`, { icon: "🏆" });
                    useUserStore.getState().fetchProfile();
                } catch (e) {
                    console.error(`[Observability] EVENT: MISSION_SYNC_EXCEPTION | Unexpected error syncing mission ${mission.id}:`, e);
                }
            }
        }
    }
}
