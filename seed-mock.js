const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const firstNames = ["Ali", "Ayşe", "Mehmet", "Fatma", "Can", "Zeynep", "Burak", "Ece", "Deniz", "Selin", "Arda", "Melis"];
const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan"];
const countries = ["TR", "US", "GB", "DE", "FR", "IT", "ES", "CA", "AU", "JP"];
const leagues = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster'];

async function seedMockUsers() {
    console.log("Seeding 50 mock users...");

    const mockUsers = [];
    for (let i = 0; i < 50; i++) {
        const userId = crypto.randomUUID();
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const league = leagues[Math.floor(Math.random() * leagues.length)];
        const xp = Math.floor(Math.random() * 50000);
        const country = countries[Math.floor(Math.random() * countries.length)];

        mockUsers.push({
            id: userId,
            email: `user${i}@mock.com`,
            full_name: `${firstName} ${lastName}`,
            total_xp: xp,
            current_league: league,
            country: country,
            subscription_tier: Math.random() > 0.7 ? 'pro' : 'free',
            current_level: Math.floor(Math.sqrt(xp / 100)) + 1
        });
    }

    const { error } = await supabase.from('profiles').upsert(mockUsers);

    if (error) {
        console.error("Error seeding users:", error);
    } else {
        console.log("Successfully seeded 50 mock users!");

        // Now trigger snapshot
        console.log("Recalculating snapshots...");
        const { data: activeSeason } = await supabase.rpc('get_active_season');
        if (activeSeason && activeSeason.length > 0) {
            await supabase.rpc('compute_leaderboard_snapshot', { p_season_id: activeSeason[0].id });
            console.log("Snapshots updated with mock data!");
        }
    }
}

seedMockUsers();
