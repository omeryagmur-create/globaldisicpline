import { createClient } from '@/lib/supabase/client';

// Simple deterministic hash function for A/B testing
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export class ABTestService {
    /**
     * Get a user's variant for a specific experiment.
     * Checks database first, falls back to deterministic hash based on userId and experiment name.
     */
    static async getVariant(experimentName: string, fallbackVariants: string[] = ['control', 'variant']): Promise<string> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Default for guests
            return fallbackVariants[0];
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('experiments')
                .eq('id', user.id)
                .single();

            const experiments = (profile?.experiments as Record<string, string>) || {};

            if (experiments[experimentName]) {
                return experiments[experimentName];
            }

            // Determine variant deterministically if not assigned
            const combinedString = `${user.id}-${experimentName}`;
            const hash = hashString(combinedString);
            const variantIndex = hash % fallbackVariants.length;
            const selectedVariant = fallbackVariants[variantIndex];

            // Save back to database
            const newExperiments = { ...experiments, [experimentName]: selectedVariant };

            // Fire and forget update
            supabase.from('profiles').update({ experiments: newExperiments }).eq('id', user.id).then(({ error }) => {
                if (error) {
                    console.error(`[Observability] EVENT: AB_TEST_SAVE_FAIL | Failed to save variant for ${experimentName}:`, error);
                }
            });

            return selectedVariant;
        } catch (error) {
            console.error(`[Observability] EVENT: AB_TEST_FETCH_FAIL | Failed to fetch variant for ${experimentName}:`, error);
            return fallbackVariants[0];
        }
    }
}
