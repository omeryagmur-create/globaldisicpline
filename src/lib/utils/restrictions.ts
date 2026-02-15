import { RESTRICTION_TYPES, RESTRICTION_DURATION, ActiveRestriction } from "@/lib/constants/restrictions";
import { addDays } from "date-fns";

// Mock database for restrictions
let MOCK_ACTIVE_RESTRICTIONS: ActiveRestriction[] = [];

export function calculateSeverity(consecutiveFailures: number): number {
    if (consecutiveFailures >= 5) return 3;
    if (consecutiveFailures >= 3) return 2;
    return 1;
}

export function getRestrictedFeatures(type: string, level: number): string[] {
    // This is a simplified lookup. In reality, you'd iterate RESTRICTION_TYPES
    if (type === 'feature_lock') {
        if (level === 1) return RESTRICTION_TYPES.FEATURE_LOCK.level1;
        if (level === 2) return [...RESTRICTION_TYPES.FEATURE_LOCK.level1, ...RESTRICTION_TYPES.FEATURE_LOCK.level2];
        if (level === 3) return RESTRICTION_TYPES.FEATURE_LOCK.level3; // 'all' covers others
    }
    if (type === 'social_reduction') {
        if (level === 1) return RESTRICTION_TYPES.SOCIAL_REDUCTION.level1;
        if (level === 2) return [...RESTRICTION_TYPES.SOCIAL_REDUCTION.level1, ...RESTRICTION_TYPES.SOCIAL_REDUCTION.level2];
        if (level === 3) return RESTRICTION_TYPES.SOCIAL_REDUCTION.level3;
    }
    // ... add others as needed
    return [];
}

export async function checkActiveRestrictions(userId: string): Promise<ActiveRestriction[]> {
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 100));

    // Filter by user and active status (and date)
    const now = new Date();
    return MOCK_ACTIVE_RESTRICTIONS.filter(r =>
        r.userId === userId &&
        r.isActive &&
        new Date(r.endDate) > now
    );
}

export function isFeatureRestricted(restrictions: ActiveRestriction[], featureName: string): boolean {
    return restrictions.some(r => r.features.includes(featureName) || r.features.includes('all_premium_features') || r.features.includes('social_features_disabled'));
}

export async function applyRestriction(userId: string, type: string, severity: 1 | 2 | 3, reason: string): Promise<ActiveRestriction> {
    const duration = RESTRICTION_DURATION[severity];
    const startDate = new Date();
    const endDate = addDays(startDate, duration);

    const features = getRestrictedFeatures(type, severity);

    const newRestriction: ActiveRestriction = {
        id: Math.random().toString(36).substring(7),
        userId,
        type,
        level: severity,
        features,
        reason,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true
    };

    MOCK_ACTIVE_RESTRICTIONS.push(newRestriction);
    console.log(`Restriction applied to user ${userId}: ${type} (Level ${severity}) for ${duration} days.`);

    return newRestriction;
}

// Helper to manually add a mock restriction for testing UI
export function addMockRestriction(userId: string) {
    applyRestriction(userId, 'social_reduction', 2, 'Failed "Morning Focus" Challenge 3 times consecutively.');
}

export function clearMockRestrictions() {
    MOCK_ACTIVE_RESTRICTIONS = [];
}
