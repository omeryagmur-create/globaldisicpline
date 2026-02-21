import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage users, subscriptions, and account status.</p>
            </div>

            <UserManagement />
        </div>
    );
}
