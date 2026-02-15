import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://cettgdzogjvmavpumkom.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldHRnZHpvZ2p2bWF2cHVta29tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA3NzIzOCwiZXhwIjoyMDg2NjUzMjM4fQ.9GwU9VcSNW5gtnRucfu1iZxtCAxK_IV6xxwxwDA2mXE";

console.log("Starting script...");

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    const email = 'admin@test.com';
    const password = 'password123';

    console.log(`Creating user ${email}...`);

    // Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users?.find(u => u.email === email);

    let userId;

    if (existingUser) {
        console.log('User already exists, getting ID...');
        userId = existingUser.id;
        // Update password just in case
        const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, { password: password, email_confirm: true });
        if (updateAuthError) console.error('Error updating auth:', updateAuthError);
    } else {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });
        if (error) {
            console.error('Error creating user:', error);
            return;
        }
        userId = data.user.id;
    }

    console.log(`User ID: ${userId}`);

    // Checks profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profile) {
        console.log('Profile exists, updating admin status...');
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true, full_name: 'Admin User', tier: 'sovereign' })
            .eq('id', userId);
        if (updateError) console.error('Error updating profile:', updateError);
        else console.log('Profile updated to Admin.');
    } else {
        console.log('Profile missing. Creating profile...');
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                full_name: 'Admin User',
                is_admin: true,
                tier: 'sovereign'
            });
        if (insertError) console.error('Error creating profile:', insertError);
        else console.log('Profile created as Admin.');
    }
}

main();
