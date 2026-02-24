const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase env vars in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncLeagues() {
    console.log("Checking active season...");
    const { data: activeSeason, error: activeErr } = await supabase.rpc('get_active_season');

    if (activeErr) {
        console.error("Error fetching active season:", activeErr);
        return;
    }

    let currentSeasonId = null;

    if (!activeSeason || activeSeason.length === 0) {
        console.log("No active season. Starting a new one...");
        const { data: newSeason, error: startErr } = await supabase.rpc('start_next_season');
        if (startErr) {
            console.error("Error starting next season:", startErr);
            return;
        }
        console.log("Started new season", newSeason);

        // fetch again
        const { data: res2 } = await supabase.rpc('get_active_season');
        if (res2 && res2.length > 0) {
            currentSeasonId = res2[0].id;
        }
    } else {
        currentSeasonId = activeSeason[0].id;
        console.log("Active season found:", currentSeasonId);
    }

    if (currentSeasonId) {
        console.log(`Computing snapshot for season ${currentSeasonId}...`);
        const { error: computeErr } = await supabase.rpc('compute_leaderboard_snapshot', {
            p_season_id: currentSeasonId
        });

        if (computeErr) {
            console.error("Error computing snapshot:", computeErr);
        } else {
            console.log("Snapshot computed successfully!");

            const { count } = await supabase.from('league_snapshots').select('*', { count: 'exact', head: true });
            console.log(`Total snapshots in current season: ${count}`);
        }
    }
}

syncLeagues();
