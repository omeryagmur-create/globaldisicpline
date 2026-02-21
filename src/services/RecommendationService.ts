import { Profile } from '@/types/user';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface GroupRecommendation {
    id: number;
    name: string;
    description: string;
    members: number;
    coverImage: string;
    reason: string;
}

export class RecommendationService {
    /**
     * Recommends study groups based on the user's focus history and country/exam.
     */
    static async getGroupRecommendations(supabase: SupabaseClient, userId: string): Promise<GroupRecommendation[]> {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('country, exam_system')
                .eq('id', userId)
                .single();

            // In a real advanced setup, we would query a 'groups' table using trigram similarity on tags,
            // matching the exam_system and country. Since groups are currently mocked in the UI,
            // we will simulate the intelligence here by returning targeted mock data based on the user's exam system.

            const exam = profile?.exam_system || 'General';
            const recommendations: GroupRecommendation[] = [];

            if (exam.includes('YKS') || (profile?.country && profile.country.includes('TR'))) {
                recommendations.push({
                    id: 101,
                    name: 'YKS 2026 Derece Kulübü',
                    description: 'Daily intense study sessions specifically tailored for Turkish YKS candidates aiming for top 1k.',
                    members: 420,
                    coverImage: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?q=80&w=200&auto=format&fit=crop',
                    reason: 'Based on your exam: YKS'
                });
            } else if (exam.includes('SAT') || (profile?.country && profile.country.includes('US'))) {
                recommendations.push({
                    id: 102,
                    name: 'SAT 1550+ Achievers',
                    description: 'English Math & Reading intense prep rounds every weekend.',
                    members: 125,
                    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=200&auto=format&fit=crop',
                    reason: 'Based on your exam: SAT'
                });
            }

            // Always add a general behavioral recommendation
            recommendations.push({
                id: 103,
                name: 'Deep Work Masterminds',
                description: 'For folks who focus for more than 4 hours a day consistently. Silence required.',
                members: 890,
                coverImage: 'https://images.unsplash.com/photo-1523240715639-93f8bb0a6a0e?q=80&w=200&auto=format&fit=crop',
                reason: 'Based on your recent focus streaks'
            });

            return recommendations;

        } catch (error) {
            console.error('[Observability] EVENT: REC_ENGINE_FAIL | Error fetching group recommendations:', error);
            return [];
        }
    }
}
