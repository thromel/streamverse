const database = require('../services/database');
const ratingAggregator = require('../services/rating-aggregator');

const getProfile = async (req, res, next) => {
    const email = req.params.email;

    try {
        const result = await database.simpleExecute(
            'SELECT * FROM profile WHERE email = :email',
            { email }
        );
        res.status(200).json({ profile: result.rows });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Cannot get profile from database' });
    }
};

const addProfile = async (req, res, next) => {
    const { EMAIL, PROFILE_ID, DOB } = req.body;

    try {
        await database.simpleExecute(
            'INSERT INTO profile (profile_id, email, dob) VALUES (:pid, :email, :dob)',
            { pid: PROFILE_ID, email: EMAIL, dob: DOB }
        );
        res.status(201).json({ message: 'Successfully created profile' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Failed to add profile to database' });
    }
};

const updateProfile = async (req, res, next) => {
    const { EMAIL, DOB, PROFILE_ID } = req.body;

    try {
        await database.simpleExecute(
            'UPDATE profile SET dob = :dob WHERE email = :email AND profile_id = :pid',
            { dob: DOB, email: EMAIL, pid: PROFILE_ID }
        );
        res.status(201).json({ message: 'Successfully updated profile' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Failed to update profile' });
    }
};

const deleteProfile = async (req, res, next) => {
    const { EMAIL, PROFILE_ID } = req.body;

    try {
        await database.simpleExecute(
            'DELETE FROM profile WHERE profile_id = :pid AND email = :email',
            { pid: PROFILE_ID, email: EMAIL }
        );
        res.status(201).json({ message: 'Successfully deleted profile' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Failed to delete profile' });
    }
};

const hasWatchListed = async (req, res, next) => {
    let { EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID } = req.body;
    if (!MOVIE_ID) MOVIE_ID = '';
    if (!SHOW_ID) SHOW_ID = '';

    const query = `
        (SELECT movie_id, email, profile_id
         FROM movie_watchlist
         WHERE email = :email AND profile_id = :profile_id AND movie_id = :movie_id)
        UNION
        (SELECT show_id, email, profile_id
         FROM show_watchlist
         WHERE email = :email AND profile_id = :profile_id AND show_id = :show_id)
    `;

    try {
        const result = await database.simpleExecute(query, {
            email: EMAIL,
            profile_id: PROFILE_ID,
            movie_id: MOVIE_ID,
            show_id: SHOW_ID,
        });
        res.status(200).json({ message: result.rows.length > 0 ? 'YES' : 'NO' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Couldnt get watchlist info' });
    }
};

const addToWatchList = async (req, res, next) => {
    let { EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID } = req.body;

    try {
        if (!MOVIE_ID) {
            await database.simpleExecute(
                'INSERT INTO show_watchlist (show_id, profile_id, email) VALUES (:show_id, :profile_id, :email)',
                { email: EMAIL, profile_id: PROFILE_ID, show_id: SHOW_ID }
            );
        } else {
            await database.simpleExecute(
                'INSERT INTO movie_watchlist (movie_id, profile_id, email) VALUES (:movie_id, :profile_id, :email)',
                { email: EMAIL, profile_id: PROFILE_ID, movie_id: MOVIE_ID }
            );
        }
        res.status(200).json({ message: 'added' });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

const deleteWatchList = async (req, res, next) => {
    const { EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID } = req.body;

    try {
        if (MOVIE_ID) {
            await database.simpleExecute(
                `DELETE FROM movie_watchlist
                 WHERE email = :email AND profile_id = :profile_id AND movie_id = :movie_id`,
                { email: EMAIL, profile_id: PROFILE_ID, movie_id: MOVIE_ID }
            );
        } else {
            await database.simpleExecute(
                `DELETE FROM show_watchlist
                 WHERE email = :email AND profile_id = :profile_id AND show_id = :show_id`,
                { email: EMAIL, profile_id: PROFILE_ID, show_id: SHOW_ID }
            );
        }
        res.status(200).json({ message: 'deleted' });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

const getWatchList = async (req, res, next) => {
    const { PROFILE_ID, EMAIL } = req.body;

    const query = `
        SELECT mw.movie_id, m.title, m.description, m.rating, m.maturity_rating, m.image_url
        FROM movie_watchlist mw
        JOIN movie m ON mw.movie_id = m.movie_id
        WHERE mw.email = :email AND mw.profile_id = :profile_id`;

    const query1 = `
        SELECT sw.show_id, s.title, s.description, s.rating, s.maturity_rating, s.image_url
        FROM show_watchlist sw
        JOIN show s ON sw.show_id = s.show_id
        WHERE sw.email = :email AND sw.profile_id = :profile_id`;

    try {
        const result = await database.simpleExecute(query, { email: EMAIL, profile_id: PROFILE_ID });
        const result1 = await database.simpleExecute(query1, { email: EMAIL, profile_id: PROFILE_ID });

        res.status(200).json({
            arr: [
                { title: 'Shows', data: result1.rows },
                { title: 'Movies', data: result.rows },
            ],
        });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

async function setMovieRating(movieId, email, profileId, rating) {
    const existing = await database.simpleExecute(
        `SELECT rating FROM movie_watch
         WHERE movie_id = :movie_id AND profile_id = :profile_id AND email = :email`,
        { movie_id: movieId, profile_id: profileId, email }
    );

    if (existing.rows.length === 0) {
        await database.simpleExecute(
            `INSERT INTO movie_watch (movie_id, email, profile_id, rating)
             VALUES (:movie_id, :email, :profile_id, :rating)`,
            { movie_id: movieId, email, profile_id: profileId, rating }
        );
        await ratingAggregator.updateMovieRatingOnInsert(movieId, rating);
    } else {
        const oldRating = existing.rows[0].RATING;
        await database.simpleExecute(
            `UPDATE movie_watch SET rating = :rating
             WHERE movie_id = :movie_id AND profile_id = :profile_id AND email = :email`,
            { movie_id: movieId, email, profile_id: profileId, rating }
        );
        await ratingAggregator.updateMovieRatingOnUpdate(movieId, rating, oldRating);
    }
}

async function setShowRating(showId, email, profileId, rating) {
    const existing = await database.simpleExecute(
        `SELECT rating FROM show_watch
         WHERE show_id = :show_id AND profile_id = :profile_id AND email = :email`,
        { show_id: showId, profile_id: profileId, email }
    );

    if (existing.rows.length === 0) {
        await database.simpleExecute(
            `INSERT INTO show_watch (show_id, email, profile_id, rating)
             VALUES (:show_id, :email, :profile_id, :rating)`,
            { show_id: showId, email, profile_id: profileId, rating }
        );
        await ratingAggregator.updateShowRatingOnInsert(showId, rating);
    } else {
        const oldRating = existing.rows[0].RATING;
        await database.simpleExecute(
            `UPDATE show_watch SET rating = :rating
             WHERE show_id = :show_id AND profile_id = :profile_id AND email = :email`,
            { show_id: showId, email, profile_id: profileId, rating }
        );
        await ratingAggregator.updateShowRatingOnUpdate(showId, rating, oldRating);
    }
}

const addRating = async (req, res, next) => {
    const { EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID, RATING } = req.body;

    try {
        if (MOVIE_ID) {
            await setMovieRating(MOVIE_ID, EMAIL, PROFILE_ID, RATING);
        } else {
            await setShowRating(SHOW_ID, EMAIL, PROFILE_ID, RATING);
        }
        res.status(200).json({ message: 'Inserted rating' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Failed to set rating' });
    }
};

const findRating = async (req, res, next) => {
    const { EMAIL, PROFILE_ID, MOVIE_ID, SHOW_ID } = req.body;

    try {
        if (MOVIE_ID) {
            const result = await database.simpleExecute(
                `SELECT COALESCE(rating, -1) AS rating FROM movie_watch
                 WHERE movie_id = :movie_id AND profile_id = :profile_id AND email = :email`,
                { movie_id: MOVIE_ID, profile_id: PROFILE_ID, email: EMAIL }
            );
            const rating = result.rows.length ? result.rows[0].RATING : -1;
            res.status(200).json({ rating });
        } else {
            const result = await database.simpleExecute(
                `SELECT COALESCE(rating, -1) AS rating FROM show_watch
                 WHERE show_id = :show_id AND profile_id = :profile_id AND email = :email`,
                { show_id: SHOW_ID, profile_id: PROFILE_ID, email: EMAIL }
            );
            const rating = result.rows.length ? result.rows[0].RATING : -1;
            res.status(200).json({ rating });
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ err });
    }
};

const getTime = async (req, res, next) => {
    const { movie_id, profile_id, email, show_id, episode_no, season_no } = req.query;

    try {
        if (movie_id) {
            const result = await database.simpleExecute(
                `SELECT COALESCE(watched_upto, 0) AS watched_upto FROM movie_watch
                 WHERE movie_id = :movie_id AND profile_id = :profile_id AND email = :email`,
                { movie_id, profile_id, email }
            );
            const watched = result.rows.length ? result.rows[0].WATCHED_UPTO : 0;
            res.status(200).json({ WATCHED_UPTO: watched });
        } else if (show_id) {
            const result = await database.simpleExecute(
                `SELECT COALESCE(watched_upto, 0) AS watched_upto FROM episode_watch
                 WHERE show_id = :show_id AND season_no = :season_no AND episode_no = :episode_no
                   AND profile_id = :profile_id AND email = :email`,
                { show_id, season_no, episode_no, profile_id, email }
            );
            const watched = result.rows.length ? result.rows[0].WATCHED_UPTO : 0;
            res.status(200).json({ WATCHED_UPTO: watched });
        }
    } catch (err) {
        console.log(err);
    }
};

const setTime = async (req, res, next) => {
    const { movie_id, show_id, season_no, episode_no, profile_id, email, watched_upto } = req.body;

    try {
        if (movie_id) {
            await database.simpleExecute(
                `INSERT INTO movie_watch (movie_id, profile_id, email, watched_upto, time)
                 VALUES (:movie_id, :profile_id, :email, :tm, NOW())
                 ON CONFLICT (movie_id, email, profile_id)
                 DO UPDATE SET watched_upto = EXCLUDED.watched_upto, time = NOW()`,
                { movie_id, profile_id, email, tm: watched_upto }
            );
            res.status(200).json({ message: 'Time saved for movie' });
        } else if (show_id && episode_no && season_no) {
            await database.simpleExecute(
                `INSERT INTO episode_watch (show_id, season_no, episode_no, profile_id, email, watched_upto, time)
                 VALUES (:show_id, :season_no, :episode_no, :profile_id, :email, :tm, NOW())
                 ON CONFLICT (profile_id, season_no, show_id, episode_no, email)
                 DO UPDATE SET watched_upto = EXCLUDED.watched_upto, time = NOW()`,
                { show_id, season_no, episode_no, profile_id, email, tm: watched_upto }
            );
            res.status(200).json({ message: 'Time saved for the episode' });
        }
    } catch (err) {
        console.log(err);
    }
};

const movieContinueWatching = async (req, res, next) => {
    const query = `
        SELECT m.movie_id, m.title, m.description, m.image_url, m.video_url,
               m.rating, EXTRACT(YEAR FROM m.release_date) AS release_date, w.time
        FROM movie_watch w
        JOIN movie m ON m.movie_id = w.movie_id
        WHERE w.email = :email AND w.profile_id = :profile_id AND w.watched_upto > 0
        ORDER BY w.time DESC`;
    const { profile_id, email } = req.query;

    try {
        const result = await database.simpleExecute(query, { profile_id, email });
        res.status(200).json({ title: 'Continue Watching', data: result.rows });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

const showContinueWatching = async (req, res, next) => {
    const query = `
        SELECT s.show_id, s.title, s.image_url, s.description,
               ROUND(s.rating::numeric, 2) AS rating,
               EXTRACT(YEAR FROM s.start_date) AS release_date
        FROM show s
        JOIN episode_watch ew ON s.show_id = ew.show_id
        WHERE ew.email = :email AND ew.profile_id = :profile_id
        GROUP BY s.show_id, s.title, s.image_url, s.description, s.rating, s.start_date
        ORDER BY MAX(ew.time) DESC`;
    const { profile_id, email } = req.query;

    try {
        const result = await database.simpleExecute(query, { profile_id, email });
        res.status(200).json({ title: 'Continue Watching', data: result.rows });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

const episodeContinueWatching = async (req, res, next) => {};

exports.getProfile = getProfile;
exports.addProfile = addProfile;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;
exports.hasWatchListed = hasWatchListed;
exports.addToWatchList = addToWatchList;
exports.deleteWatchList = deleteWatchList;
exports.addRating = addRating;
exports.getWatchList = getWatchList;
exports.findRating = findRating;
exports.getTime = getTime;
exports.setTime = setTime;
exports.movieContinueWatching = movieContinueWatching;
exports.showContinueWatching = showContinueWatching;
exports.episodeContinueWatching = episodeContinueWatching;
