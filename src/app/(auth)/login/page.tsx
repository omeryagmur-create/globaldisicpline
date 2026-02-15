import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - Global Discipline Engine",
    description: "Sign in to your account",
};

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                    Welcome Back
                </h1>
                <p className="text-muted-foreground text-sm">
                    Enter your credentials to access your dashboard
                </p>
            </div>
            <LoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    );
}
