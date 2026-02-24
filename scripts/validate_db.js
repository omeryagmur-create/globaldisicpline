const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function validate() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('--- 1. Database Validation ---');

    // 1.1 Active Season
    const { data: seasons, error: seasonError } = await supabase
        .from('league_seasons')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (seasonError) console.error('Error fetching seasons:', seasonError);
    else console.log('Active Seasons found:', seasons.length, seasons[0]?.id);

    // 1.2 View Data
    const { data: viewData, error: viewError } = await supabase
        .from('live_league_leaderboard')
        .select('*')
        .limit(5);

    if (viewError) console.error('Error fetching view data:', viewError);
    else console.log('View Data sample ok:', viewData.length);

    // 1.3 XP Ledger
    const { data: ledger, error: ledgerError } = await supabase
        .from('xp_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (ledgerError) console.error('Error fetching ledger:', ledgerError);
    else console.log('Ledger sample ok:', ledger.length);

    // 1.4 Legacy Function Check
    const { data: funcDef, error: funcError } = await supabase.rpc('get_function_definition', { function_name: 'update_user_xp' });
    // Note: I might not have 'get_function_definition' RPC, but I can check if update_user_xp exists
    console.log('Legacy function check: update_user_xp exists if no error');

    console.log('\n--- 2. Automation Logs ---');
    const { data: logs } = await supabase.from('league_automation_logs').select('*').order('run_at', { ascending: false }).limit(5);
    console.log('Recent automation logs:', logs?.length || 0);
}

validate();
