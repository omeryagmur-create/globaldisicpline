"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { generatePlan } from "@/lib/planner-utils"

type FormValues = {
    examDate: Date;
    dailyHours: number;
    subjects: { name: string; weight: number; }[];
};

const formSchema: z.ZodType<FormValues> = z.object({
    examDate: z.date(),
    dailyHours: z.coerce.number().min(1).max(12),
    subjects: z.array(z.object({
        name: z.string().min(1),
        weight: z.coerce.number().min(1).max(10),
    })),
})

interface PlannerSetupProps {
    onCreatePlan: (data: { examDate: string, totalWeeks: number, subjects: string[], dailyHours: number, tasks: { task_date: string, subject: string, topic: string, estimated_duration: number }[] }) => Promise<void>
}

export function PlannerSetup({ onCreatePlan }: PlannerSetupProps) {
    const [loading, setLoading] = useState(false)
    const [subjectsList, setSubjectsList] = useState([{ name: "", weight: 5 }])

    const form = useForm<FormValues>({
        // @ts-expect-error Zod typing mismatch with hook form internally
        resolver: zodResolver(formSchema),
        defaultValues: {
            dailyHours: 4,
            subjects: [{ name: "", weight: 5 }],
        },
    })

    const addSubject = () => {
        const newSubs = [...subjectsList, { name: "", weight: 5 }]
        setSubjectsList(newSubs)
        form.setValue("subjects", newSubs)
    }

    const removeSubject = (index: number) => {
        const newSubs = subjectsList.filter((_, i) => i !== index)
        setSubjectsList(newSubs)
        form.setValue("subjects", newSubs)
    }

    const updateSubject = (index: number, field: "name" | "weight", value: string | number) => {
        const newSubs = [...subjectsList]
        if (field === "name") {
            newSubs[index].name = value as string;
        } else {
            newSubs[index].weight = value as number;
        }
        setSubjectsList(newSubs)
        form.setValue("subjects", newSubs)
    }

    const onSubmit = async (values: FormValues) => {
        setLoading(true)
        try {
            const planResult = generatePlan({
                examDate: values.examDate,
                dailyHours: values.dailyHours,
                subjects: values.subjects
            });

            await onCreatePlan({
                examDate: values.examDate.toISOString(),
                dailyHours: values.dailyHours,
                totalWeeks: planResult.totalWeeks,
                subjects: values.subjects.map((s) => s.name),
                tasks: planResult.generatedTasks
            })
            toast.success(`Plan created successfully for ${planResult.totalWeeks} weeks!`)
        } catch (error) {
            toast.error("Failed to create plan: " + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create Study Plan</CardTitle>
                <CardDescription>Configure your exam date and subjects. We&apos;ll generate a schedule for you.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    {/* @ts-expect-error mismatch in submit handler */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            // @ts-expect-error FormField control type mismatch
                            control={form.control}
                            name="examDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Exam Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value instanceof Date ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            // @ts-expect-error FormField control type mismatch
                            control={form.control}
                            name="dailyHours"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Daily Study Goal (Hours)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel>Subjects & Priority (1-10)</FormLabel>
                                <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Subject
                                </Button>
                            </div>

                            {subjectsList.map((subject, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Subject Name (e.g. Math)"
                                            value={subject.name}
                                            onChange={(e) => updateSubject(index, "name", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={subject.weight}
                                            onChange={(e) => updateSubject(index, "weight", parseInt(e.target.value))}
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSubject(index)} disabled={subjectsList.length === 1}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...
                                </>
                            ) : (
                                "Generate My Plan"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
