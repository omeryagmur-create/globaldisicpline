"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EXAM_TYPES, SUBJECTS_BY_TYPE, calculateNetScore, MockExamType } from "@/lib/mock-exams";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

import { useRouter } from "next/navigation";

const formSchema = z.object({
    examType: z.enum(['YKS', 'LGS', 'KPSS', 'Custom']),
    examDate: z.date(),
    subjects: z.array(z.object({
        subject: z.string(),
        correct: z.number().min(0),
        wrong: z.number().min(0),
        empty: z.number().min(0),
    })).min(1, "At least one subject is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface UploadFormProps {
    onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("manual");
    const supabase = createClient();
    const router = useRouter();

    const defaultExamType = "YKS";
    const defaultSubjects = SUBJECTS_BY_TYPE[defaultExamType].map(s => ({
        subject: s,
        correct: 0,
        wrong: 0,
        empty: 0
    }));

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            examType: defaultExamType,
            examDate: new Date(),
            subjects: defaultSubjects,
        },
    });

    const watchExamType = form.watch("examType");

    // Update subjects when exam type changes
    const handleExamTypeChange = (value: MockExamType) => {
        form.setValue("examType", value);
        const newSubjects = SUBJECTS_BY_TYPE[value].map(s => ({
            subject: s,
            correct: 0,
            wrong: 0,
            empty: 0
        }));
        form.setValue("subjects", newSubjects);
    };

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Calculate totals
            let totalCorrect = 0;
            let totalWrong = 0;
            let totalEmpty = 0;
            let totalQuestions = 0;
            let totalNet = 0;

            const breakdown = values.subjects.map(s => {
                const net = calculateNetScore(s.correct, s.wrong, values.examType);
                totalCorrect += s.correct;
                totalWrong += s.wrong;
                totalEmpty += s.empty;
                totalQuestions += s.correct + s.wrong + s.empty;
                totalNet += net;

                return {
                    ...s,
                    net
                };
            });

            // Identify weak topics (success rate < 50%)
            const weakTopics = breakdown
                .filter(s => {
                    const total = s.correct + s.wrong + s.empty;
                    if (total === 0) return false;
                    return (s.correct / total) < 0.5;
                })
                .map(s => s.subject);

            const { error } = await supabase.from("mock_exams").insert({
                user_id: user.id,
                exam_type: values.examType,
                exam_date: values.examDate.toISOString(),
                total_questions: totalQuestions,
                correct_answers: totalCorrect,
                wrong_answers: totalWrong,
                empty_answers: totalEmpty,
                net_score: totalNet,
                subject_breakdown: breakdown,
                weak_topics: weakTopics,
            });

            if (error) throw error;

            toast.success("Exam results saved successfully!");
            form.reset();
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save exam results");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Add Mock Exam Result</CardTitle>
                <CardDescription>Enter your exam scores manually or upload a file.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="upload" disabled title="Coming soon">File Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4 pt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="examType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exam Type</FormLabel>
                                                <Select onValueChange={(val) => handleExamTypeChange(val as MockExamType)} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select exam type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {EXAM_TYPES.map(type => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
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
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
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
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label>Subject Scores</Label>
                                    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 border rounded-md p-4 bg-muted/20">
                                        {form.watch("subjects")?.map((subject, index) => (
                                            <div key={index} className="grid grid-cols-4 items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                                <Label className="col-span-1 font-medium">{subject.subject}</Label>
                                                <div className="col-span-3 grid grid-cols-3 gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`subjects.${index}.correct`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-green-600">Correct</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`subjects.${index}.wrong`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-red-600">Wrong</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`subjects.${index}.empty`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs text-gray-500">Empty</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" min="0" {...field} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>Saving...</>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Analysis
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="upload" className="pt-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:bg-muted/10 transition-colors cursor-not-allowed opacity-60">
                            <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-1">Upload Results File</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Drag and drop your exam result PDF or Excel file here.
                            </p>
                            <Button disabled variant="outline">Select File</Button>
                            <p className="text-xs text-muted-foreground mt-4">Feature coming soon!</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
