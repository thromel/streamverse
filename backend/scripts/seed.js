#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const database = require('../services/database');

const BACKUP_DIR = path.join(__dirname, '../../Table Backup');

function loadJson(filename) {
    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`Skipping missing backup file: ${filename}`);
        return [];
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data.RECORDS || [];
}

function parseDate(value) {
    if (!value || value === '') return null;
    const parts = value.split(' ')[0].split('/');
    if (parts.length !== 3) return value;
    const [day, month, year] = parts;
    const timePart = value.includes(' ') ? value.split(' ')[1] : '00:00:00';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timePart}`;
}

function num(value, fallback = null) {
    if (value === '' || value === null || value === undefined) return fallback;
    return Number(value);
}

function str(value) {
    if (value === null || value === undefined) return null;
    return String(value).trim();
}

async function seedTable(name, fn) {
    const rows = loadJson(`${name}.json`);
    if (rows.length === 0) return;
    console.log(`Seeding ${name} (${rows.length} rows)...`);
    for (const row of rows) {
        await fn(row);
    }
}

async function main() {
    await database.initialize();

    await seedTable('USER_NETFLIX', async (r) => {
        await database.simpleExecute(
            `INSERT INTO user_netflix (name, email, dob, country, credit_card, password, phone, joined, max_profiles)
             VALUES (:name, :email, :dob, :country, :credit_card, :password, :phone, :joined, :max_profiles)
             ON CONFLICT (email) DO NOTHING`,
            {
                name: str(r.NAME),
                email: str(r.EMAIL),
                dob: parseDate(r.DOB),
                country: str(r.COUNTRY),
                credit_card: str(r.CREDIT_CARD),
                password: str(r.PASSWORD),
                phone: str(r.PHONE),
                joined: parseDate(r.JOINED),
                max_profiles: num(r.MAX_PROFILES, 0),
            }
        );
    });

    await seedTable('PROFILE', async (r) => {
        await database.simpleExecute(
            `INSERT INTO profile (profile_id, email, dob)
             VALUES (:profile_id, :email, :dob)
             ON CONFLICT (email, profile_id) DO NOTHING`,
            {
                profile_id: str(r.PROFILE_ID),
                email: str(r.EMAIL),
                dob: parseDate(r.DOB),
            }
        );
    });

    await seedTable('SUBSCRIPTION', async (r) => {
        await database.simpleExecute(
            `INSERT INTO subscription (sub_id, sub_type, email, start_date, end_date, bill, total_bill, running, termination_date)
             OVERRIDING SYSTEM VALUE
             VALUES (:sub_id, :sub_type, :email, :start_date, :end_date, :bill, :total_bill, :running, :termination_date)
             ON CONFLICT (sub_id, email) DO NOTHING`,
            {
                sub_id: num(r.SUB_ID),
                sub_type: str(r.SUB_TYPE),
                email: str(r.EMAIL),
                start_date: parseDate(r.START_DATE),
                end_date: parseDate(r.END_DATE),
                bill: num(r.BILL, 0),
                total_bill: num(r.TOTAL_BILL, 0),
                running: r.RUNNING === '' ? null : num(r.RUNNING),
                termination_date: parseDate(r.TERMINATION_DATE),
            }
        );
    });

    await seedTable('GENRE', async (r) => {
        await database.simpleExecute(
            `INSERT INTO genre (genre_id, name, contents) VALUES (:genre_id, :name, :contents)
             ON CONFLICT (genre_id) DO NOTHING`,
            { genre_id: num(r.GENRE_ID), name: str(r.NAME), contents: num(r.CONTENTS, 0) }
        );
    });

    await seedTable('CELEB', async (r) => {
        await database.simpleExecute(
            `INSERT INTO celeb (celeb_id, name, contents) VALUES (:celeb_id, :name, :contents)
             ON CONFLICT (celeb_id) DO NOTHING`,
            { celeb_id: num(r.CELEB_ID), name: str(r.NAME), contents: num(r.CONTENTS, 0) }
        );
    });

    await seedTable('MOVIE', async (r) => {
        await database.simpleExecute(
            `INSERT INTO movie (movie_id, title, country, rating, total_views, total_votes, description,
                                image_url, video_url, length, language, price, maturity_rating, release_date)
             VALUES (:movie_id, :title, :country, :rating, :total_views, :total_votes, :description,
                     :image_url, :video_url, :length, :language, :price, :maturity_rating, :release_date)
             ON CONFLICT (movie_id) DO NOTHING`,
            {
                movie_id: num(r.MOVIE_ID),
                title: str(r.TITLE),
                country: str(r.COUNTRY),
                rating: num(r.RATING, 0),
                total_views: num(r.TOTAL_VIEWS, 0),
                total_votes: num(r.TOTAL_VOTES, 0),
                description: str(r.DESCRIPTION),
                image_url: str(r.IMAGE_URL),
                video_url: str(r.VIDEO_URL),
                length: num(r.LENGTH, 0),
                language: str(r.LANGUAGE),
                price: num(r.PRICE, 0),
                maturity_rating: str(r.MATURITY_RATING),
                release_date: parseDate(r.RELEASE_DATE),
            }
        );
    });

    await seedTable('SHOW', async (r) => {
        await database.simpleExecute(
            `INSERT INTO show (show_id, title, start_date, end_date, country, rating, total_views, total_votes,
                               description, image_url, video_url, length, language, seasons, episodes, price, maturity_rating)
             VALUES (:show_id, :title, :start_date, :end_date, :country, :rating, :total_views, :total_votes,
                     :description, :image_url, :video_url, :length, :language, :seasons, :episodes, :price, :maturity_rating)
             ON CONFLICT (show_id) DO NOTHING`,
            {
                show_id: num(r.SHOW_ID),
                title: str(r.TITLE),
                start_date: parseDate(r.START_DATE),
                end_date: parseDate(r.END_DATE),
                country: str(r.COUNTRY),
                rating: num(r.RATING, 0),
                total_views: num(r.TOTAL_VIEWS, 0),
                total_votes: num(r.TOTAL_VOTES, 0),
                description: str(r.DESCRIPTION),
                image_url: str(r.IMAGE_URL),
                video_url: str(r.VIDEO_URL),
                length: num(r.LENGTH, 0),
                language: str(r.LANGUAGE),
                seasons: num(r.SEASONS, 0),
                episodes: num(r.EPISODES, 0),
                price: num(r.PRICE, 0),
                maturity_rating: str(r.MATURITY_RATING),
            }
        );
    });

    await seedTable('MOVIE_GENRE', async (r) => {
        await database.simpleExecute(
            `INSERT INTO movie_genre (movie_id, genre_id) VALUES (:movie_id, :genre_id)
             ON CONFLICT DO NOTHING`,
            { movie_id: num(r.MOVIE_ID), genre_id: num(r.GENRE_ID) }
        );
    });

    await seedTable('SHOW_GENRE', async (r) => {
        await database.simpleExecute(
            `INSERT INTO show_genre (show_id, genre_id) VALUES (:show_id, :genre_id)
             ON CONFLICT DO NOTHING`,
            { show_id: num(r.SHOW_ID), genre_id: num(r.GENRE_ID) }
        );
    });

    await seedTable('MOVIE_CELEB', async (r) => {
        await database.simpleExecute(
            `INSERT INTO movie_celeb (movie_id, celeb_id, role) VALUES (:movie_id, :celeb_id, :role)
             ON CONFLICT DO NOTHING`,
            { movie_id: num(r.MOVIE_ID), celeb_id: num(r.CELEB_ID), role: str(r.ROLE) }
        );
    });

    await seedTable('SHOW_CELEB', async (r) => {
        await database.simpleExecute(
            `INSERT INTO show_celeb (show_id, celeb_id, role) VALUES (:show_id, :celeb_id, :role)
             ON CONFLICT DO NOTHING`,
            { show_id: num(r.SHOW_ID), celeb_id: num(r.CELEB_ID), role: str(r.ROLE) }
        );
    });

    await seedTable('MOVIE_WATCHLIST', async (r) => {
        await database.simpleExecute(
            `INSERT INTO movie_watchlist (movie_id, email, profile_id) VALUES (:movie_id, :email, :profile_id)
             ON CONFLICT DO NOTHING`,
            { movie_id: num(r.MOVIE_ID), email: str(r.EMAIL), profile_id: str(r.PROFILE_ID) }
        );
    });

    await seedTable('SHOW_WATCHLIST', async (r) => {
        await database.simpleExecute(
            `INSERT INTO show_watchlist (show_id, email, profile_id) VALUES (:show_id, :email, :profile_id)
             ON CONFLICT DO NOTHING`,
            { show_id: num(r.SHOW_ID), email: str(r.EMAIL), profile_id: str(r.PROFILE_ID) }
        );
    });

    await seedTable('MOVIE_WATCH', async (r) => {
        await database.simpleExecute(
            `INSERT INTO movie_watch (movie_id, profile_id, email, rating, watched_upto, time)
             VALUES (:movie_id, :profile_id, :email, :rating, :watched_upto, :time)
             ON CONFLICT DO NOTHING`,
            {
                movie_id: num(r.MOVIE_ID),
                profile_id: str(r.PROFILE_ID),
                email: str(r.EMAIL),
                rating: num(r.RATING),
                watched_upto: num(r.WATCHED_UPTO, 0),
                time: parseDate(r.TIME) || new Date(),
            }
        );
    });

    // Stub episode rows required by episode_watch FK (no EPISODE.json in backup)
    const episodeWatchRows = loadJson('EPISODE_WATCH.json');
    const episodeKeys = new Set();
    for (const r of episodeWatchRows) {
        const key = `${r.SHOW_ID}:${r.SEASON_NO}:${r.EPISODE_NO}`;
        if (episodeKeys.has(key)) continue;
        episodeKeys.add(key);
        await database.simpleExecute(
            `INSERT INTO episode (season_no, episode_no, show_id, title, description)
             VALUES (:season_no, :episode_no, :show_id, :title, :description)
             ON CONFLICT DO NOTHING`,
            {
                season_no: num(r.SEASON_NO),
                episode_no: num(r.EPISODE_NO),
                show_id: num(r.SHOW_ID),
                title: `Episode ${r.EPISODE_NO}`,
                description: 'Seeded placeholder episode',
            }
        );
    }

    await seedTable('SHOW_WATCH', async (r) => {
        await database.simpleExecute(
            `INSERT INTO show_watch (profile_id, email, show_id, rating, status, watched_upto, time)
             VALUES (:profile_id, :email, :show_id, :rating, :status, :watched_upto, :time)
             ON CONFLICT DO NOTHING`,
            {
                profile_id: str(r.PROFILE_ID),
                email: str(r.EMAIL),
                show_id: num(r.SHOW_ID),
                rating: num(r.RATING),
                status: str(r.STATUS),
                watched_upto: num(r.WATCHED_UPTO),
                time: parseDate(r.TIME) || new Date(),
            }
        );
    });

    await seedTable('EPISODE_WATCH', async (r) => {
        await database.simpleExecute(
            `INSERT INTO episode_watch (profile_id, email, season_no, episode_no, show_id, status, watched_upto, time)
             VALUES (:profile_id, :email, :season_no, :episode_no, :show_id, :status, :watched_upto, :time)
             ON CONFLICT DO NOTHING`,
            {
                profile_id: str(r.PROFILE_ID),
                email: str(r.EMAIL),
                season_no: num(r.SEASON_NO),
                episode_no: num(r.EPISODE_NO),
                show_id: num(r.SHOW_ID),
                status: str(r.STATUS),
                watched_upto: num(r.WATCHED_UPTO, 0),
                time: parseDate(r.TIME) || new Date(),
            }
        );
    });

    await database.simpleExecute(
        `SELECT setval(pg_get_serial_sequence('subscription', 'sub_id'),
                       COALESCE((SELECT MAX(sub_id) FROM subscription), 1))`
    );

    console.log('Seed complete.');
    await database.close();
}

main().catch(async (err) => {
    console.error(err);
    await database.close();
    process.exit(1);
});
