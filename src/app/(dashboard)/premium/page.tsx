import { PricingCards } from "@/components/premium/PricingCards";
import { FeatureComparison } from "@/components/premium/FeatureComparison";
import { PremiumInsights } from "@/components/premium/PremiumInsights";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Since this is a client component usage inside a page.tsx, we can't export metadata directly if it's "use client".
// However, page.tsx is usually server component. Let's make this page.tsx a server component.

export default function PremiumPage() {
    return (
        <div className="container mx-auto p-4 space-y-12 max-w-5xl pb-16">
            {/* HERO SECTION */}
            <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Unlock Your Full Potential
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Get the tools you need to master your exams. Join thousands of students achieving their dreams with Global Discipline Premium.
                </p>
            </div>

            {/* PREMIUM INSIGHTS */}
            <div className="space-y-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">The Premium Advantage</h2>
                    <p className="text-muted-foreground text-sm mt-1">See what Global Discipline PRO users achieve on average.</p>
                </div>
                <PremiumInsights />
            </div>

            {/* PRICING CARDS */}
            <PricingCards />

            {/* COMPARISON TABLE */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center">Compare Plans</h2>
                <FeatureComparison />
            </div>

            {/* FAQ SECTION */}
            <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
                        <AccordionContent>
                            Yes! You can cancel your subscription at any time from your account settings. You&apos;ll keep access until the end of your billing period.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                        <AccordionContent>
                            We accept all major credit cards (Visa, Mastercard, Amex) via Stripe secure checkout.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Do you offer student discounts?</AccordionTrigger>
                        <AccordionContent>
                            Our pricing is already optimized for students! However, we occasionally run special promotions for groups or specific exam periods.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What happens to my data if I downgrade?</AccordionTrigger>
                        <AccordionContent>
                            Your data is safe. If you downgrade to Free, you&apos;ll simply lose access to Premium features (like advanced analytics history beyond the free limit), but your core data remains.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
