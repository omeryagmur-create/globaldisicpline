"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export function SignupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                    },
                },
            });

            if (authError) {
                toast.error(authError.message);
                return;
            }

            if (authData.user) {
                toast.success("Account created successfully!");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full bg-card/50 backdrop-blur-sm border-muted/40 shadow-xl">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                <CardDescription>
                    Enter your information to get started
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Full Name"
                                className="pl-9 bg-background/50 border-input/60 focus:border-primary/50 transition-colors"
                                {...form.register("fullName")}
                            />
                        </div>
                        {form.formState.errors.fullName && (
                            <p className="text-xs text-destructive ml-1">
                                {form.formState.errors.fullName.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="name@example.com"
                                type="email"
                                className="pl-9 bg-background/50 border-input/60 focus:border-primary/50 transition-colors"
                                {...form.register("email")}
                            />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-xs text-destructive ml-1">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Password"
                                type="password"
                                className="pl-9 bg-background/50 border-input/60 focus:border-primary/50 transition-colors"
                                {...form.register("password")}
                            />
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-xs text-destructive ml-1">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Confirm Password"
                                type="password"
                                className="pl-9 bg-background/50 border-input/60 focus:border-primary/50 transition-colors"
                                {...form.register("confirmPassword")}
                            />
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <p className="text-xs text-destructive ml-1">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button className="w-full font-semibold shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Sign Up"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
                        Log in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
