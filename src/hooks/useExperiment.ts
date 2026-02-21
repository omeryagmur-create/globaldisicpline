"use client";

import { useEffect, useState } from 'react';
import { ABTestService } from '@/services/ABTestService';

export function useExperiment(experimentName: string, fallbackVariants: string[] = ['control', 'variant']): string {
    const [variant, setVariant] = useState<string>(fallbackVariants[0]);

    useEffect(() => {
        let isMounted = true;

        const fetchVariant = async () => {
            const result = await ABTestService.getVariant(experimentName, fallbackVariants);
            if (isMounted) {
                setVariant(result);
            }
        };

        fetchVariant();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [experimentName, JSON.stringify(fallbackVariants)]);

    return variant;
}
