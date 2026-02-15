import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/mock/UploadForm";
import { ResultsChart } from "@/components/mock/ResultsChart";
import { SubjectBreakdown } from "@/components/mock/SubjectBreakdown";
import { WeakAreasDisplay } from "@/components/mock/WeakAreasDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mock Exam Analysis - Global Discipline Engine",
    description: "Track and analyze your mock exam performance.",
};

async function getMockExams() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: exams, error } = await supabase
        .from("mock_exams")
        .select("*")
        .eq("user_id", user.id)
        .order("exam_date", { ascending: false });

    if (error) {
        console.error("Error fetching mock exams:", error);
        return [];
    }

    return exams || [];
}

export default async function MockAnalysisPage() {
    const exams = await getMockExams();
    const latestExam = exams[0];

    return (
        <div className="container mx-auto p-4 space-y-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mock Exam Analysis</h1>
                    <p className="text-muted-foreground">
                        Track your progress and identify areas for improvement.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Upload Form & History */}
                <div className="lg:col-span-1 space-y-6">
                    <UploadForm />

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Exams</CardTitle>
                            <CardDescription>Your exam history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {exams.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No exams recorded yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {exams.map((exam) => (
                                        <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                            <div>
                                                <p className="font-medium">{exam.exam_type}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(exam.exam_date), "PPP")}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-primary">{Number(exam.net_score).toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground">Net Score</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detailed Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    {!latestExam ? (
                        <Card className="h-full flex items-center justify-center min-h-[400px] border-dashed">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-medium">No Data Available</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Upload your first mock exam result to see detailed analysis and personalized insights.
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <Tabs defaultValue="overview" className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">
                                    Analysis: {latestExam.exam_type} ({format(new Date(latestExam.exam_date), "MMMM d, yyyy")})
                                </h2>
                                <TabsList>
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="subjects">Subjects</TabsTrigger>
                                    <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ResultsChart
                                        correct={latestExam.correct_answers}
                                        wrong={latestExam.wrong_answers}
                                        empty={latestExam.empty_answers}
                                        netScore={latestExam.net_score}
                                    />
                                    <WeakAreasDisplay data={latestExam.subject_breakdown} />
                                </div>
                            </TabsContent>

                            <TabsContent value="subjects">
                                <SubjectBreakdown data={latestExam.subject_breakdown} />
                            </TabsContent>

                            <TabsContent value="weaknesses">
                                <WeakAreasDisplay data={latestExam.subject_breakdown} />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    );
}
