"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface CheckoutButtonProps {
    tier: 'pro' | 'elite';
    interval: 'monthly' | 'yearly';
}

export function CheckoutButton({ tier, interval }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            // TODO: Integrate RevenueCat/Stripe checkout session
            // const { sessionId } = await createCheckoutSession(tier, interval);
            // stripe.redirectToCheckout({ sessionId });

            // Simulation
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Redirecting to checkout for ${tier.toUpperCase()} plan...`);
            console.log(`Checkout initiated for ${tier} ${interval}`);
        } catch (error) {
            toast.error("Failed to initiate checkout. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            className="w-full"
            onClick={handleCheckout}
            disabled={loading}
            variant={tier === 'elite' ? 'default' : 'outline'}
        >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </Button>
    );
}
