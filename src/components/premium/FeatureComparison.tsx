"use client";

import { Check, Minus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function FeatureComparison() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Feature</TableHead>
                        <TableHead className="text-center">Free</TableHead>
                        <TableHead className="text-center text-primary font-bold">Pro</TableHead>
                        <TableHead className="text-center text-yellow-600 font-bold">Elite</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <CompareRow feature="Study Plans" free="1" pro="Unlimited" elite="Unlimited" />
                    <CompareRow feature="Mock Analyses" free="3" pro="Unlimited" elite="Unlimited" />
                    <CompareRow feature="Active Challenges" free="1" pro="3" elite="Unlimited" />
                    <CompareRow feature="XP Multiplier" free="1x" pro="1.2x" elite="1.2x" />
                    <CompareRow feature="Advanced Analytics" free={false} pro={true} elite={true} />
                    <CompareRow feature="AI Planner Suggestions" free={false} pro={true} elite={true} />
                    <CompareRow feature="Custom Challenges" free={false} pro={false} elite={true} />
                    <CompareRow feature="Priority Support" free={false} pro={false} elite={true} />
                    <CompareRow feature="Team Features" free={false} pro={false} elite={true} />
                    <CompareRow feature="Ad-Free" free={false} pro={true} elite={true} />
                </TableBody>
            </Table>
        </div>
    );
}

function CompareRow({ feature, free, pro, elite }: { feature: string; free: string | boolean; pro: string | boolean; elite: string | boolean }) {
    const renderValue = (val: string | boolean) => {
        if (typeof val === 'boolean') {
            return val ? <Check className="h-5 w-5 mx-auto text-green-500" /> : <Minus className="h-5 w-5 mx-auto text-muted-foreground" />;
        }
        return val;
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{feature}</TableCell>
            <TableCell className="text-center">{renderValue(free)}</TableCell>
            <TableCell className="text-center font-medium bg-primary/5">{renderValue(pro)}</TableCell>
            <TableCell className="text-center font-medium bg-yellow-50/50">{renderValue(elite)}</TableCell>
        </TableRow>
    );
}
