import { RESTRICTION_TYPES, RESTRICTION_DURATION, ActiveRestriction } from "@/lib/constants/restrictions";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export function calculateSeverity(consecutiveFailures: number): number {
    if (consecutiveFailures >= 5) return 3;
    if (consecutiveFailures >= 3) return 2;
    return 1;
}

export function getRestrictedFeatures(type: string, level: number): string[] {
    if (type === 'feature_lock') {
        if (level === 1) return RESTRICTION_TYPES.FEATURE_LOCK.level1;
        if (level === 2) return [...RESTRICTION_TYPES.FEATURE_LOCK.level1, ...RESTRICTION_TYPES.FEATURE_LOCK.level2];
        if (level === 3) return RESTRICTION_TYPES.FEATURE_LOCK.level3;
    }
    if (type === 'social_reduction') {
        if (level === 1) return RESTRICTION_TYPES.SOCIAL_REDUCTION.level1;
        if (level === 2) return [...RESTRICTION_TYPES.SOCIAL_REDUCTION.level1, ...RESTRICTION_TYPES.SOCIAL_REDUCTION.level2];
        if (level === 3) return RESTRICTION_TYPES.SOCIAL_REDUCTION.level3;
    }
    return [];
}

export async function checkActiveRestrictions(userId: string): Promise<ActiveRestriction[]> {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('restrictions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('end_date', now);

    if (error) {
        console.error("Failed to fetch active restrictions from Supabase:", error);
        return [];
    }

    return (data || []).map(r => ({
        id: r.id,
        userId: r.user_id,
        type: r.type,
        level: r.level,
        features: r.features,
        reason: r.reason || '',
        startDate: r.start_date,
        endDate: r.end_date,
        isActive: r.is_active
    }));
}

export function isFeatureRestricted(restrictions: ActiveRestriction[], featureName: string): boolean {
    return restrictions.some(r => r.features.includes(featureName) || r.features.includes('all_premium_features') || r.features.includes('social_features_disabled'));
}

export async function applyRestriction(userId: string, type: string, severity: 1 | 2 | 3, reason: string): Promise<ActiveRestriction> {
    const duration = RESTRICTION_DURATION[severity];
    const startDate = new Date();
    const endDate = addDays(startDate, duration);
    const features = getRestrictedFeatures(type, severity);

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('restrictions')
        .insert({
            user_id: userId,
            type,
            level: severity,
            features,
            reason,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to insert restriction into Supabase:", error);
        throw new Error("Persist restriction failed");
    }

    return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        level: data.level,
        features: data.features,
        reason: data.reason || '',
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active
    };
}
