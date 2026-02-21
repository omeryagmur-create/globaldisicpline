"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PlannerSetup } from "@/components/planner/PlannerSetup";
import { PlannerView } from "@/components/planner/PlannerView";
import { createStudyPlan, updateTask } from "@/actions/planner";
import { BookOpen } from "lucide-react";

interface PlannerContentProps {
    plan: any;
    tasks: any[];
}

export function PlannerContent({ plan, tasks }: PlannerContentProps) {
    const { t } = useLanguage();

    if (!plan) {
        return (
            <div className="container mx-auto max-w-4xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.planner.setupTitle}</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {t.planner.setupSubtitle}
                    </p>
                </div>
                <PlannerSetup onCreatePlan={createStudyPlan} />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl space-y-8">
            <PlannerView
                plan={plan}
                tasks={tasks}
                onToggleTask={updateTask}
            />
        </div>
    );
}
