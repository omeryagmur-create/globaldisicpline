"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X, ShieldAlert } from "lucide-react";
import { ActiveRestriction } from "@/lib/constants/restrictions";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function RestrictionBanner() {
    const [restrictions, setRestrictions] = useState<ActiveRestriction[]>([]);
    const [visible, setVisible] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRestrictions = async () => {
            try {
                const response = await fetch('/api/restrictions/active');
                if (response.ok) {
                    const data = await response.json();
                    setRestrictions(data.restrictions || []);
                }
            } catch (error) {
                console.error("Failed to fetch restrictions:", error);
            }
        };

        fetchRestrictions();

        // Listen for custom event 'restrictionUpdated' for demo purposes
        const handleUpdate = () => fetchRestrictions();
        window.addEventListener('restrictionUpdated', handleUpdate);

        return () => window.removeEventListener('restrictionUpdated', handleUpdate);
    }, []);

    if (restrictions.length === 0 || !visible) return null;

    // Display the most severe restriction or the first one
    const active = restrictions[0];

    return (
        <div className="bg-destructive/10 border-b border-destructive/20 p-4 animate-in slide-in-from-top duration-300">
            <div className="container mx-auto max-w-7xl flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                        System Restriction Active
                        <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full capitalize">
                            {active.type.replace('_', ' ')}
                        </span>
                    </h4>
                    <p className="text-sm text-destructive/80 mt-1">
                        {active.reason} This restriction will expire in {formatDistanceToNow(new Date(active.endDate))}.
                    </p>
                    {active.features.length > 0 && (
                        <p className="text-xs text-destructive/70 mt-2">
                            <strong>Restricted Features:</strong> {active.features.map(f => f.replace(/_/g, ' ')).join(', ')}
                        </p>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive/50 hover:text-destructive shrink-0"
                    onClick={() => setVisible(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
