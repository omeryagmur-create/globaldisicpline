"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success(t.auth.successLogin);
            router.push("/dashboard");
            router.refresh();
        } catch (_error) {
            toast.error(t.auth.errorUnexpected);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
            <div className="w-full border border-white/10 bg-white/5 backdrop-blur-2xl rounded-[40px] p-10 shadow-2xl space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                        <Lock className="text-white size-8" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{t.auth.loginTitle}</h1>
                    <p className="text-white/40 font-medium">{t.auth.loginSubtitle}</p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                placeholder={t.auth.emailPlaceholder}
                                type="email"
                                className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all font-medium"
                                {...form.register("email")}
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-xs text-red-400 font-bold ml-2">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                placeholder={t.auth.passwordPlaceholder}
                                type="password"
                                className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all font-medium"
                                {...form.register("password")}
                            />
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-xs text-red-400 font-bold ml-2">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/reset-password"
                            className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                        >
                            {t.auth.forgotPassword}
                        </Link>
                    </div>

                    <Button
                        className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-white/5"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 size-6 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">{t.auth.signIn} <ArrowRight size={20} /></span>
                        )}
                    </Button>
                </form>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-[#0b0c14] px-4 text-white/30 font-black uppercase tracking-widest">
                            {t.auth.orContinueWith}
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
                    className="w-full h-14 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl font-bold transition-all"
                >
                    <FcGoogle className="mr-3 size-6" />
                    {t.auth.continueGoogle}
                </Button>

                <div className="pt-4 text-center">
                    <p className="text-white/40 font-medium text-sm">
                        {t.auth.newToEngine}{" "}
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-black transition-colors">
                            {t.auth.createAccount}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
