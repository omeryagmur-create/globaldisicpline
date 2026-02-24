"use client";

import { useEffect, useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/useUserStore";

export function RestrictionBanner() {
    const [visible, setVisible] = useState(true);
    const { activeRestrictions, checkRestrictions } = useUserStore();

    useEffect(() => {
        if (activeRestrictions.length === 0) {
            checkRestrictions();
        }

        // Listen for custom event 'restrictionUpdated' for demo purposes
        const handleUpdate = () => checkRestrictions();
        window.addEventListener('restrictionUpdated', handleUpdate);

        return () => window.removeEventListener('restrictionUpdated', handleUpdate);
    }, [activeRestrictions.length, checkRestrictions]);

    if (activeRestrictions.length === 0 || !visible) return null;

    // Display the most severe restriction or the first one
    const active = activeRestrictions[0];

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
