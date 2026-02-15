import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up - Global Discipline Engine",
    description: "Create a new account",
};

export default function SignupPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                    Join the Movement
                </h1>
                <p className="text-muted-foreground text-sm">
                    Start your journey to global discipline today
                </p>
            </div>
            <SignupForm />
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
