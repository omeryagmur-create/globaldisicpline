import { ExamForm } from "@/components/admin/ExamForm";

export default function AdminExamsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Exam Systems</h1>
                <p className="text-muted-foreground">Manage exam curriculums, subjects, and topics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Add New System</h2>
                    <ExamForm />
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Existing Systems</h2>
                    <div className="border rounded-md p-4 text-sm text-muted-foreground">
                        List of existing systems will appear here.
                        (Mock: TR-YKS, US-SAT)
                    </div>
                </div>
            </div>
        </div>
    );
}
