import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password - Global Discipline Engine",
    description: "Reset your password",
};

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                    Account Recovery
                </h1>
                <p className="text-muted-foreground text-sm">
                    Follow the instructions to recover your account
                </p>
            </div>
            <PasswordResetForm />
        </div>
    );
}
