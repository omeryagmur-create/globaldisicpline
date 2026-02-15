"use client";

import { Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "./CheckoutButton";
import { Badge } from "@/components/ui/badge";

export function PricingCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE TIER */}
            <Card className="flex flex-col border-muted shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-xl">Free</CardTitle>
                    <CardDescription>Essential tools for disciplined study.</CardDescription>
                    <div className="mt-4">
                        <span className="text-3xl font-bold">$0</span>
                        <span className="text-muted-foreground">/month</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                    <FeatureItem text="Basic Dashboard" />
                    <FeatureItem text="1 Active Study Plan" />
                    <FeatureItem text="3 Mock Exam Analyses" />
                    <FeatureItem text="1 Active Challenge" />
                    <FeatureItem text="Standard XP Rate" />
                    <FeatureItem text="Advanced Analytics" included={false} />
                    <FeatureItem text="AI Planner Suggestions" included={false} />
                </CardContent>
                <CardFooter>
                    <div className="w-full py-2 text-center text-sm text-muted-foreground">
                        Current Plan
                    </div>
                </CardFooter>
            </Card>

            {/* PRO TIER */}
            <Card className="flex flex-col border-primary/20 shadow-md relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                </div>
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Pro</CardTitle>
                    <CardDescription>Advanced features for serious students.</CardDescription>
                    <div className="mt-4">
                        <span className="text-3xl font-bold">$9.99</span>
                        <span className="text-muted-foreground">/month</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                    <FeatureItem text="Everything in Free" />
                    <FeatureItem text="Unlimited Study Plans" />
                    <FeatureItem text="Unlimited Mock Analyses" />
                    <FeatureItem text="Advanced Analytics" />
                    <FeatureItem text="+20% XP Bonus" />
                    <FeatureItem text="3 Active Challenges" />
                    <FeatureItem text="AI Planner Suggestions" />
                </CardContent>
                <CardFooter>
                    <CheckoutButton tier="pro" interval="monthly" />
                </CardFooter>
            </Card>

            {/* ELITE TIER */}
            <Card className="flex flex-col border-yellow-500/20 shadow-lg bg-gradient-to-b from-yellow-50/50 to-background dark:from-yellow-900/10 dark:to-background hover:shadow-xl transition-shadow">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                        Elite
                        <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">VIP</Badge>
                    </CardTitle>
                    <CardDescription>Maximum power for top performers.</CardDescription>
                    <div className="mt-4">
                        <span className="text-3xl font-bold">$19.99</span>
                        <span className="text-muted-foreground">/month</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                    <FeatureItem text="Everything in Pro" />
                    <FeatureItem text="Priority Support" />
                    <FeatureItem text="Custom Challenges" />
                    <FeatureItem text="Team Features" />
                    <FeatureItem text="Unlimited Challenges" />
                    <FeatureItem text="Exclusive Badges" />
                    <FeatureItem text="Ad-Free Experience" />
                </CardContent>
                <CardFooter>
                    <CheckoutButton tier="elite" interval="monthly" />
                </CardFooter>
            </Card>
        </div>
    );
}

function FeatureItem({ text, included = true }: { text: string; included?: boolean }) {
    return (
        <div className="flex items-center text-sm">
            {included ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
            ) : (
                <X className="h-4 w-4 mr-2 text-muted-foreground opacity-50" />
            )}
            <span className={included ? "" : "text-muted-foreground line-through opacity-70"}>{text}</span>
        </div>
    );
}
