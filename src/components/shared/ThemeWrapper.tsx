"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const { profile } = useUserStore();

    useEffect(() => {
        if (profile?.active_theme && profile.active_theme !== "default") {
            document.documentElement.setAttribute('data-custom-theme', profile.active_theme);
        } else {
            document.documentElement.removeAttribute('data-custom-theme');
        }

        if (profile?.active_border && profile.active_border !== "default") {
            document.documentElement.setAttribute('data-custom-border', profile.active_border);
        } else {
            document.documentElement.removeAttribute('data-custom-border');
        }
    }, [profile?.active_theme, profile?.active_border]);

    return <>{children}</>;
}
