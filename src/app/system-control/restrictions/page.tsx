import { RestrictionControl } from "@/components/admin/RestrictionControl";

export default function AdminRestrictionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Adaptive Restriction Control</h1>
                <p className="text-muted-foreground">Monitor and manage system-imposed restrictions.</p>
            </div>

            <RestrictionControl />
        </div>
    );
}
