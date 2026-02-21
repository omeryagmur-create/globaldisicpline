"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, Language } from "./translations";

const STORAGE_KEY = "gde-language";

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en | typeof translations.tr;
}

const LanguageContext = createContext<LanguageContextValue>({
    language: "en",
    setLanguage: () => { },
    t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
            if (stored && (stored === "en" || stored === "tr")) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLanguageState(stored);
            }
        } catch { }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch { }
        // Update html lang attribute for accessibility / SEO
        if (typeof document !== "undefined") {
            document.documentElement.lang = lang;
        }
    }, []);

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
