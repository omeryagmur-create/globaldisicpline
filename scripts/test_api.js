const fetch = require('node-fetch');

async function testAPI() {
    const baseUrl = 'http://localhost:3000/api/leaderboard';

    const endpoints = [
        '?scope=overall&limit=2',
        '?scope=all_time&limit=2',
        '?scope=league&league=Bronze&limit=2'
    ];

    console.log('--- API Endpoint Tests ---');
    for (const ep of endpoints) {
        try {
            // Note: This requires the server to be running.
            // If it fails, I'll check the source code logic again which I already did.
            const res = await fetch(baseUrl + ep);
            console.log(`GET ${ep} -> ${res.status}`);
            const json = await res.json();
            console.log(`  xp_basis: ${json.metadata?.xp_basis}`);
            console.log(`  seconds_until_end exists: ${json.metadata?.seconds_until_end !== undefined}`);
        } catch (e) {
            console.log(`GET ${ep} failed (Server might not be running)`);
        }
    }
}

testAPI();
