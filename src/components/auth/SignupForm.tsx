"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export function SignupForm() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                    },
                },
            });

            if (signUpError) {
                toast.error(signUpError.message);
                return;
            }

            toast.success(t.auth.successSignup);
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
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-2 gap-0 overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl rounded-[40px] shadow-2xl">
                {/* Left Side: Form */}
                <div className="p-8 lg:p-12 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white tracking-tight">{t.auth.signupTitle}</h1>
                        <p className="text-white/40 font-medium">{t.auth.signupSubtitle}</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    placeholder={t.auth.namePlaceholder}
                                    type="text"
                                    className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all font-medium"
                                    {...form.register("fullName")}
                                />
                            </div>
                            {form.formState.errors.fullName && (
                                <p className="text-xs text-red-400 font-bold ml-2">
                                    {form.formState.errors.fullName.message}
                                </p>
                            )}
                        </div>

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

                        <Button
                            className="w-full h-14 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 size-6 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">{t.auth.signupButton} <ArrowRight size={20} /></span>
                            )}
                        </Button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px]">
                            <span className="bg-[#0b0c14] px-4 text-white/30 font-black uppercase tracking-widest">
                                {t.auth.orFastPass}
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

                    <div className="pt-2 text-center">
                        <p className="text-white/40 font-medium text-sm">
                            {t.auth.alreadyPilot}{" "}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-black transition-colors">
                                {t.auth.loginLink}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Side: Visuals/Social Proof */}
                <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-indigo-600/20 to-purple-800/20 border-l border-white/5 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-12">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-white leading-tight">{t.auth.socialProofTitle}</h3>
                            <p className="text-white/60 font-medium leading-relaxed italic">{t.auth.socialProofQuote}</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                t.auth.feature1,
                                t.auth.feature2,
                                t.auth.feature3
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                                        <CheckCircle2 className="size-5 text-indigo-400" />
                                    </div>
                                    <span className="text-white font-black uppercase tracking-wider text-xs">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <div className="flex items-center -space-x-3 mb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Image key={i} src={`https://www.shadcnblocks.com/images/block/avatar-${i}.webp`} alt={`Avatar ${i}`} width={40} height={40} className="size-10 rounded-full border-2 border-[#121421] object-cover" />
                                ))}
                            </div>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{t.auth.activePerformers}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
