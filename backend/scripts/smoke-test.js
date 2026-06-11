#!/usr/bin/env node
/**
 * Quick API smoke test. Requires backend running and database seeded.
 * Usage: node scripts/smoke-test.js [baseUrl]
 */
const baseUrl = process.argv[2] || `http://localhost:${process.env.PORT || 5001}`;

async function get(path) {
    const res = await fetch(`${baseUrl}${path}`);
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
}

async function post(path, payload) {
    const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
}

async function main() {
    const failures = [];

    const plans = await get('/api/subscription/plans');
    if (!plans.body.plans?.length) failures.push('subscription plans');

    const movies = await get('/api/browse/movies/all');
    if (!movies.body.movies?.length) failures.push('browse movies/all');

    const profiles = await get('/api/profiles/romel.rcs@gmail.com');
    if (!profiles.body.profile?.length) failures.push('profiles');

    const signupEmail = `smoke-${Date.now()}@test.local`;
    const signup = await post('/api/users/signup', {
        NAME: 'Smoke Test',
        EMAIL: signupEmail,
        DOB: '1990-01-01',
        COUNTRY: 'US',
        CREDIT_CARD: '0000',
        PASSWORD: 'testpass123',
        PHONE: '555-0100',
    });
    if (signup.status !== 201 || !signup.body.token) failures.push('signup');

    const login = await post('/api/users/login', {
        EMAIL: signupEmail,
        PASSWORD: 'testpass123',
    });
    if (login.status !== 201 || !login.body.token) failures.push('login');

    if (failures.length) {
        console.error('Smoke test FAILED:', failures.join(', '));
        process.exit(1);
    }

    console.log('Smoke test PASSED');
    console.log(`  plans: ${plans.body.plans.length}`);
    console.log(`  movies: ${movies.body.movies.length}`);
    console.log(`  profiles (seed user): ${profiles.body.profile.length}`);
    console.log(`  signup/login: ok`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
