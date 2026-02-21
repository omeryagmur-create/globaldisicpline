"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                    {t.auth.loginWelcome}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {t.auth.loginSubheading}
                </p>
            </div>
            <LoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
                {t.auth.agreeText}{" "}
                <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    {t.auth.terms}
                </Link>{" "}
                {t.auth.and}{" "}
                <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    {t.auth.privacy}
                </Link>
                .
            </p>
        </div>
    );
}
