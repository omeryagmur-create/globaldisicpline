"use server";

import { createClient } from "@/lib/supabase/server";
import { RecommendationService, GroupRecommendation } from "@/services/RecommendationService";

export async function getPersonalizedGroups(): Promise<GroupRecommendation[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    return await RecommendationService.getGroupRecommendations(supabase, user.id);
}
