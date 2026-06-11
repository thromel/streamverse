#!/usr/bin/env node
/**
 * Optional TMDB data loader. Requires TMDB_API_KEY in .env and an empty or partial database.
 * Usage: node scripts/run-tmdb.js
 */
const database = require('../services/database');
const tmdb = require('../services/tmdb');

async function main() {
    await database.initialize();
    console.log('Loading genres...');
    await tmdb.fetchGenreData();
    console.log('Loading movies (1 page)...');
    await tmdb.fetchMovieData(1, 1);
    console.log('Loading shows (1 page)...');
    await tmdb.fetchShowData(1);
    console.log('TMDB load complete.');
    await database.close();
}

main().catch(async (err) => {
    console.error(err);
    await database.close();
    process.exit(1);
});
