import { ExamSystemManager } from "@/components/admin/ExamForm";

export default function AdminExamsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Exam Systems</h1>
                <p className="text-muted-foreground">Manage exam curriculums and system codes. Data is persisted to database in real-time.</p>
            </div>

            <ExamSystemManager />
        </div>
    );
}
