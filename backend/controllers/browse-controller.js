const database = require('../services/database');
const cosine_similarity = require('../services/cosine_similarity');

const getMovieByGenre = async (req, res, next) => {
    const genre = req.params.genre;

    if (genre === 'all') {
        const query = `
            SELECT m.movie_id, m.title, m.image_url, m.description, m.video_url,
                   EXTRACT(YEAR FROM m.release_date) AS release_date, m.rating, g.name
            FROM movie m
            JOIN movie_genre mg ON m.movie_id = mg.movie_id
            JOIN genre g ON mg.genre_id = g.genre_id
            ORDER BY RANDOM()
            LIMIT 1000`;
        try {
            const result = await database.simpleExecute(query);
            res.status(200).json({ movies: result.rows });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Cant fetch movie data from backend' });
        }
    } else {
        const query = `
            SELECT m.*
            FROM movie m
            JOIN movie_genre mg ON m.movie_id = mg.movie_id
            JOIN genre g ON mg.genre_id = g.genre_id
            WHERE g.name = :genre
            ORDER BY m.rating DESC`;
        try {
            const result = await database.simpleExecute(query, { genre });
            res.status(200).json({ movies: result.rows });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Cant fetch movie data from backend' });
        }
    }
};

const getShowByGenre = async (req, res, next) => {
    const genre = req.params.genre;

    if (genre === 'all') {
        const query = `
            SELECT s.show_id, s.title, s.rating, s.image_url, s.description,
                   (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date,
                   g.name
            FROM show s
            JOIN show_genre sg ON s.show_id = sg.show_id
            JOIN genre g ON sg.genre_id = g.genre_id
            ORDER BY RANDOM()
            LIMIT 1000`;
        try {
            const result = await database.simpleExecute(query);
            res.status(200).json({ shows: result.rows });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Cant fetch show data from backend' });
        }
    } else {
        const query = `
            SELECT s.show_id, s.title, s.image_url, s.description,
                   EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date) AS release_date,
                   g.name
            FROM show s
            JOIN show_genre sg ON s.show_id = sg.show_id
            JOIN genre g ON sg.genre_id = g.genre_id
            WHERE g.name = :genre
            ORDER BY RANDOM()`;
        try {
            const result = await database.simpleExecute(query, { genre });
            res.status(200).json({ shows: result.rows });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Cant fetch show data from backend' });
        }
    }
};

const search = async (req, res, next) => {
    let { ss, key } = req.body;
    let result = [];
    let movieQueries = [];
    let showQueries = [];
    let space = ss;

    if (ss === 'all') space = 'movie';

    if (space === 'movie') {
        for (let i = 0; i < key.length; i += 2) {
            const param = key[i];
            const kw = key[i + 1];
            let movieQuery;

            const select = `SELECT m.movie_id, m.title, m.description, m.rating, m.video_url, m.image_url,
                                   EXTRACT(YEAR FROM m.release_date) AS release_date`;
            let from = ` FROM movie m `;
            let where = '';

            if (param === 'celeb') {
                from += ` JOIN movie_celeb mc ON m.movie_id = mc.movie_id JOIN celeb c ON c.celeb_id = mc.celeb_id `;
                where = ` WHERE LOWER(c.name) LIKE LOWER('%${kw}%') `;
            } else if (param === 'genre') {
                from += ` JOIN movie_genre mg ON m.movie_id = mg.movie_id JOIN genre g ON g.genre_id = mg.genre_id `;
                where = ` WHERE LOWER(g.name) LIKE LOWER('%${kw}%') `;
            } else if (param === 'title') {
                where = ` WHERE LOWER(m.title) LIKE LOWER('%${kw}%') OR LOWER(m.description) LIKE LOWER('%${kw}%') `;
            } else if (param === 'year') {
                where = ` WHERE EXTRACT(YEAR FROM m.release_date) = ${kw} `;
            } else if (param === 'lang') {
                where = ` WHERE LOWER(m.language) LIKE LOWER('%${kw}%') `;
            }

            if (param !== 'sim') {
                movieQuery = select + from + where;
            } else {
                movieQuery = `
                    SELECT * FROM (
                        SELECT m2.movie_id, ms.score, m2.title, m2.description, m2.image_url, m2.video_url, m2.rating,
                               EXTRACT(YEAR FROM m2.release_date) AS release_date
                        FROM movie m1
                        JOIN movie_similarity ms ON m1.movie_id = ms.movie_id1
                        JOIN movie m2 ON m2.movie_id = ms.movie_id2
                        WHERE ms.score < 1 AND ms.score > 0.05
                          AND ${typeof kw === 'number' ? `m1.movie_id = ${kw}` : `LOWER(m1.title) LIKE LOWER('%${kw}%')`}
                        ORDER BY ms.score DESC
                        LIMIT 5
                    ) sim_movies`;
            }
            movieQueries.push(movieQuery);
        }

        let movieQuery = movieQueries.length > 1 ? `(${movieQueries[0]})` : movieQueries[0];
        for (let i = 1; i < movieQueries.length; ++i) {
            movieQuery += ` INTERSECT (${movieQueries[i]})`;
        }

        try {
            const movies = await database.simpleExecute(movieQuery);
            result.push({ title: 'Search Result from Movies', data: movies.rows });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Dynamic Query 1 failed' });
        }
    }

    if (ss === 'all') space = 'show';

    if (space === 'show') {
        for (let i = 0; i < key.length; i += 2) {
            const param = key[i];
            const kw = key[i + 1];
            let showQuery;

            const select = `SELECT s.show_id, s.title, s.description, s.rating, s.image_url,
                                   (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date`;
            let from = ` FROM show s `;
            let where = '';

            if (param === 'celeb') {
                from += ` JOIN show_celeb sc ON s.show_id = sc.show_id JOIN celeb c ON c.celeb_id = sc.celeb_id `;
                where = ` WHERE LOWER(c.name) LIKE LOWER('%${kw}%') `;
            } else if (param === 'genre') {
                from += ` JOIN show_genre sg ON s.show_id = sg.show_id JOIN genre g ON g.genre_id = sg.genre_id `;
                where = ` WHERE LOWER(g.name) LIKE LOWER('%${kw}%') `;
            } else if (param === 'title') {
                where = ` WHERE LOWER(s.title) LIKE LOWER('%${kw}%') OR LOWER(s.description) LIKE LOWER('%${kw}%') `;
            } else if (param === 'year') {
                where = ` WHERE EXTRACT(YEAR FROM s.start_date) = ${kw} `;
            } else if (param === 'lang') {
                where = ` WHERE LOWER(s.language) LIKE LOWER('%${kw}%') `;
            }

            if (param !== 'sim') {
                showQuery = select + from + where;
            } else {
                showQuery = `
                    SELECT * FROM (
                        SELECT s2.show_id, ss.score, s2.title, s2.description, s2.image_url, s2.rating,
                               (EXTRACT(YEAR FROM s2.start_date) || ' - ' || EXTRACT(YEAR FROM s2.end_date)) AS release_date
                        FROM show s1
                        JOIN show_similarity ss ON s1.show_id = ss.show_id1
                        JOIN show s2 ON s2.show_id = ss.show_id2
                        WHERE ss.score < 1 AND ss.score > 0.05
                          AND ${typeof kw === 'number' ? `s1.show_id = ${kw}` : `LOWER(s1.title) LIKE LOWER('%${kw}%')`}
                        ORDER BY ss.score DESC
                        LIMIT 5
                    ) sim_shows`;
            }
            showQueries.push(showQuery);
        }

        let showQuery = showQueries.length > 1 ? `(${showQueries[0]})` : showQueries[0];
        for (let i = 1; i < showQueries.length; ++i) {
            showQuery += ` INTERSECT (${showQueries[i]})`;
        }

        try {
            const shows = await database.simpleExecute(showQuery);
            result.push({ title: 'Search Result from Shows', data: shows.rows });
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: 'Dynamic Query 2 failed' });
        }
    }

    if (ss === 'static') {
        const movieQuery = `
            (SELECT m.movie_id, m.title, m.description, m.rating, m.image_url, m.video_url,
                    EXTRACT(YEAR FROM m.release_date) AS release_date
             FROM movie m
             WHERE LOWER(title) LIKE LOWER(:kw) OR LOWER(description) LIKE (:kw))
            UNION
            (SELECT m.movie_id, m.title, m.description, m.rating, m.image_url, m.video_url,
                    EXTRACT(YEAR FROM m.release_date) AS release_date
             FROM movie m
             JOIN movie_celeb mc ON m.movie_id = mc.movie_id
             JOIN celeb c ON c.celeb_id = mc.celeb_id
             WHERE LOWER(c.name) LIKE LOWER(:kw))
            UNION
            (SELECT m.movie_id, m.title, m.description, m.rating, m.image_url, m.video_url,
                    EXTRACT(YEAR FROM m.release_date) AS release_date
             FROM movie m
             JOIN movie_genre mg ON m.movie_id = mg.movie_id
             JOIN genre g ON g.genre_id = mg.genre_id
             WHERE LOWER(g.name) LIKE LOWER(:kw))`;

        const showQuery = `
            (SELECT s.show_id, s.title, s.description, s.rating, s.image_url,
                    (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date
             FROM show s
             WHERE LOWER(title) LIKE LOWER(:kw) OR LOWER(description) LIKE (:kw))
            UNION
            (SELECT s.show_id, s.title, s.description, s.rating, s.image_url,
                    (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date
             FROM show s
             JOIN show_celeb sc ON s.show_id = sc.show_id
             JOIN celeb c ON c.celeb_id = sc.celeb_id
             WHERE LOWER(c.name) LIKE LOWER(:kw))
            UNION
            (SELECT s.show_id, s.title, s.description, s.rating, s.image_url,
                    (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date
             FROM show s
             JOIN show_genre sg ON s.show_id = sg.show_id
             JOIN genre g ON g.genre_id = sg.genre_id
             WHERE LOWER(g.name) LIKE LOWER(:kw))`;

        try {
            const kw = '%' + key + '%';
            const movies = await database.simpleExecute(movieQuery, { kw });
            const shows = await database.simpleExecute(showQuery, { kw });
            result = [
                { title: 'Search Result from Movies', data: movies.rows },
                { title: 'Search Result from Shows', data: shows.rows },
            ];
        } catch (err) {
            console.log(err);
            res.status(401).json({ message: 'Static Query failed' });
        }
    }

    res.status(200).json(result);
};

const getEpisodes = async (req, res, next) => {
    const { show_id, email, profile_id } = req.query;
    const response = [];

    const lastWatched = await database.simpleExecute(
        `SELECT ew.*, e.title AS episode_title, e.description AS episode_description, e.image_url, e.video_url
         FROM episode_watch ew
         JOIN episode e ON ew.show_id = e.show_id AND e.season_no = ew.season_no AND e.episode_no = ew.episode_no
         WHERE ew.show_id = :show_id AND ew.profile_id = :profile_id AND ew.email = :email
         ORDER BY ew.time DESC`,
        { profile_id, show_id, email }
    );

    if (lastWatched.rows.length > 0) {
        response.push({ title: 'Continue Watching', data: lastWatched.rows });
    }

    const result = await database.simpleExecute(
        'SELECT seasons FROM show WHERE show_id = :show_id',
        { show_id }
    );
    const seasons = result.rows[0]?.SEASONS || 0;

    const result1 = await database.simpleExecute(
        'SELECT * FROM episode WHERE show_id = :show_id ORDER BY season_no, episode_no',
        { show_id }
    );

    for (let s = 1; s <= seasons; ++s) {
        const data = result1.rows.filter((row) => row.SEASON_NO === s);
        response.push({ title: 'Season ' + s, data });
    }

    res.status(200).json(response);
};

const getSuggestions = async (req, res, next) => {
    const { email, profile_id } = req.query;

    try {
        const favoriteGenre = await database.simpleExecute(
            `SELECT name FROM (
                SELECT g.name
                FROM movie m
                JOIN movie_genre mg ON m.movie_id = mg.movie_id
                JOIN genre g ON mg.genre_id = g.genre_id
                JOIN movie_watch mw ON mw.movie_id = m.movie_id
                WHERE mw.rating = 10 AND mw.email = :email AND mw.profile_id = :profile_id
                GROUP BY g.name
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) fav`,
            { profile_id, email }
        );

        const lastWatchedMovie = await database.simpleExecute(
            `SELECT title FROM (
                SELECT m.title
                FROM movie_watch mw
                JOIN movie m ON m.movie_id = mw.movie_id
                WHERE mw.profile_id = :profile_id AND mw.email = :email
                ORDER BY mw.time DESC
                LIMIT 1
            ) lw`,
            { email, profile_id }
        );

        const lastWatchedRecommendation = await database.simpleExecute(
            `SELECT * FROM (
                SELECT m2.movie_id, ms.score, m2.title, m2.description, m2.image_url, m2.video_url, m2.rating,
                       EXTRACT(YEAR FROM m2.release_date) AS release_date
                FROM movie m1
                JOIN movie_similarity ms ON m1.movie_id = ms.movie_id1
                JOIN movie m2 ON m2.movie_id = ms.movie_id2
                WHERE ms.score < 1 AND ms.score > 0.05
                  AND m1.movie_id = (
                      SELECT movie_id FROM movie_watch
                      WHERE profile_id = :profile_id AND email = :email
                      ORDER BY time DESC LIMIT 1
                  )
                ORDER BY ms.score DESC
                LIMIT 5
            ) lwr`,
            { profile_id, email }
        );

        const similarityRecommendation = await database.simpleExecute(
            `SELECT * FROM (
                SELECT m2.movie_id, ms.score, m2.title, m2.description, m2.image_url, m2.video_url, m2.rating,
                       EXTRACT(YEAR FROM m2.release_date) AS release_date
                FROM movie m1
                JOIN movie_similarity ms ON m1.movie_id = ms.movie_id1
                JOIN movie m2 ON m2.movie_id = ms.movie_id2
                WHERE ms.score < 1 AND ms.score > 0.05
                  AND m1.movie_id IN (
                      SELECT movie_id FROM movie_watch
                      WHERE profile_id = :profile_id AND email = :email
                      ORDER BY time DESC LIMIT 10
                  )
                ORDER BY ms.score DESC
                LIMIT 20
            ) sim`,
            { profile_id, email }
        );

        const showSimilarityRecommendation = await database.simpleExecute(
            `SELECT * FROM (
                SELECT s2.show_id, ss.score, s2.title, s2.description, s2.image_url, s2.rating,
                       (EXTRACT(YEAR FROM s2.start_date) || ' - ' || EXTRACT(YEAR FROM s2.end_date)) AS release_date
                FROM show s1
                JOIN show_similarity ss ON s1.show_id = ss.show_id1
                JOIN show s2 ON s2.show_id = ss.show_id2
                WHERE ss.score < 1 AND ss.score > 0.05
                  AND s1.show_id IN (
                      SELECT show_id FROM episode_watch
                      WHERE profile_id = :profile_id AND email = :email
                      GROUP BY show_id LIMIT 10
                  )
                ORDER BY ss.score DESC
                LIMIT 20
            ) ssim`,
            { email, profile_id }
        );

        const genreRecommendation = await database.simpleExecute(
            `SELECT * FROM (
                SELECT * FROM (
                    SELECT m.movie_id, m.title, m.image_url, m.description,
                           ROUND((m.total_votes * m.rating / (m.total_votes + 10000))
                                 + (10000 * (SELECT AVG(rating) FROM movie) / (m.total_votes + 10000)), 2) AS rating,
                           EXTRACT(YEAR FROM m.release_date) AS release_date
                    FROM movie m
                    JOIN movie_genre mg ON m.movie_id = mg.movie_id
                    WHERE mg.genre_id = (
                        SELECT genre_id FROM (
                            SELECT g.genre_id
                            FROM movie m
                            JOIN movie_genre mg ON m.movie_id = mg.movie_id
                            JOIN genre g ON mg.genre_id = g.genre_id
                            JOIN movie_watch mw ON mw.movie_id = m.movie_id
                            WHERE mw.rating = 10 AND mw.email = :email AND mw.profile_id = :profile_id
                            GROUP BY g.genre_id
                            ORDER BY COUNT(*) DESC
                            LIMIT 1
                        ) fg
                    )
                    EXCEPT
                    SELECT m.movie_id, m.title, m.image_url, m.description,
                           ROUND((m.total_votes * m.rating / (m.total_votes + 10000))
                                 + (10000 * (SELECT AVG(rating) FROM movie) / (m.total_votes + 10000)), 2) AS rating,
                           EXTRACT(YEAR FROM m.release_date) AS release_date
                    FROM movie m
                    JOIN movie_genre mg ON m.movie_id = mg.movie_id
                    JOIN movie_watch mw ON mw.movie_id = m.movie_id
                    WHERE mw.profile_id = :profile_id AND mw.email = :email
                      AND mg.genre_id = (
                          SELECT genre_id FROM (
                              SELECT g.genre_id
                              FROM movie m
                              JOIN movie_genre mg ON m.movie_id = mg.movie_id
                              JOIN genre g ON mg.genre_id = g.genre_id
                              JOIN movie_watch mw ON mw.movie_id = m.movie_id
                              WHERE mw.rating = 10
                              GROUP BY g.genre_id
                              ORDER BY COUNT(*) DESC
                              LIMIT 1
                          ) fg2
                      )
                    ORDER BY rating DESC
                    LIMIT 10
                ) gr
            ) genre_rec`,
            { profile_id, email }
        );

        const favoriteShowGenre = await database.simpleExecute(
            `SELECT genre_id, name FROM (
                SELECT sg.genre_id, g.name
                FROM episode_watch ew
                JOIN show_genre sg ON ew.show_id = sg.show_id
                JOIN genre g ON sg.genre_id = g.genre_id
                WHERE ew.profile_id = :profile_id AND ew.email = :email
                GROUP BY sg.genre_id, g.name
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ) fsg`,
            { profile_id, email }
        );

        const showGenreRecommendation = await database.simpleExecute(
            `SELECT * FROM (
                SELECT s.show_id, s.title, s.image_url, s.description,
                       ROUND((s.total_votes * s.rating / (s.total_votes + 10000))
                             + (10000 * (SELECT AVG(rating) FROM show) / (s.total_votes + 10000)), 2) AS rating,
                       (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date
                FROM show s
                JOIN show_genre sg ON s.show_id = sg.show_id
                WHERE sg.genre_id = (
                    SELECT genre_id FROM (
                        SELECT sg.genre_id, g.name
                        FROM episode_watch ew
                        JOIN show_genre sg ON ew.show_id = sg.show_id
                        JOIN genre g ON sg.genre_id = g.genre_id
                        WHERE ew.profile_id = :profile_id AND ew.email = :email
                        GROUP BY sg.genre_id, g.name
                        ORDER BY COUNT(*) DESC
                        LIMIT 1
                    ) fsg2
                )
                ORDER BY rating DESC
                LIMIT 10
            ) sgr`,
            { email, profile_id }
        );

        const lastWatchedShow = await database.simpleExecute(
            `SELECT title FROM (
                SELECT s.title
                FROM show s
                JOIN episode_watch ew ON s.show_id = ew.show_id
                WHERE ew.email = :email AND ew.profile_id = :profile_id
                GROUP BY s.show_id, s.title
                ORDER BY MAX(ew.time) DESC
                LIMIT 1
            ) lws`,
            { email, profile_id }
        );

        const lastWatchedShowRecommendation = await database.simpleExecute(
            `SELECT * FROM (
                SELECT s2.show_id, ss.score, s2.title, s2.image_url, s2.description,
                       ROUND((s2.total_votes * s2.rating / (s2.total_votes + 10000))
                             + (10000 * (SELECT AVG(rating) FROM show) / (s2.total_votes + 10000)), 2) AS rating
                FROM show s1
                JOIN show_similarity ss ON ss.show_id1 = s1.show_id
                JOIN show s2 ON ss.show_id2 = s2.show_id
                WHERE ss.score < 1 AND ss.score > 0.05
                  AND s1.show_id = (
                      SELECT show_id FROM (
                          SELECT s.show_id
                          FROM show s
                          JOIN episode_watch ew ON s.show_id = ew.show_id
                          WHERE ew.email = :email AND ew.profile_id = :profile_id
                          GROUP BY s.show_id
                          ORDER BY MAX(ew.time) DESC
                          LIMIT 1
                      ) lwsid
                  )
                ORDER BY ss.score DESC
                LIMIT 5
            ) lwsr`,
            { email, profile_id }
        );

        const mostWatched = await database.simpleExecute(
            `SELECT w.movie_id, m.title, m.rating, m.image_url, m.description, m.video_url
             FROM movie_watch w
             JOIN movie m ON w.movie_id = m.movie_id
             GROUP BY w.movie_id, m.title, m.rating, m.image_url, m.description, m.video_url
             ORDER BY COUNT(*) DESC
             LIMIT 50`
        );

        const topRated = await database.simpleExecute(
            `SELECT movie_id, title, description, image_url,
                    EXTRACT(YEAR FROM release_date) AS release_date,
                    ROUND((total_votes * rating / (total_votes + 10000))
                          + (10000 * (SELECT AVG(rating) FROM movie) / (total_votes + 10000)), 2) AS rating
             FROM movie
             ORDER BY rating DESC
             LIMIT 50`
        );

        const topRatedShows = await database.simpleExecute(
            `SELECT show_id, title, description, image_url,
                    EXTRACT(YEAR FROM start_date) AS start_date,
                    ROUND((total_votes * rating / (total_votes + 10000))
                          + (10000 * (SELECT AVG(rating) FROM show) / (total_votes + 10000)), 2) AS rating
             FROM show
             ORDER BY rating DESC
             LIMIT 50`
        );

        const mostWatchedShows = await database.simpleExecute(
            `SELECT w.show_id, s.title, s.rating, s.image_url, s.description
             FROM show_watch w
             JOIN show s ON w.show_id = s.show_id
             GROUP BY w.show_id, s.title, s.rating, s.image_url, s.description
             ORDER BY COUNT(*) DESC
             LIMIT 50`
        );

        const suggestions = [
            { title: 'Recommended Movies for you', data: similarityRecommendation.rows },
            { title: 'Recommended Shows for you', data: showSimilarityRecommendation.rows },
            {
                title: 'Because you like ' + (favoriteGenre.rows[0]?.NAME || 'popular') + ' movies',
                data: genreRecommendation.rows,
            },
            {
                title: 'Because you watched ' + (lastWatchedMovie.rows[0]?.TITLE || 'something'),
                data: lastWatchedRecommendation.rows,
            },
            {
                title: 'Because you like ' + (favoriteShowGenre.rows[0]?.NAME || 'popular') + ' shows',
                data: showGenreRecommendation.rows,
            },
            {
                title: 'Because you watched ' + (lastWatchedShow.rows[0]?.TITLE || 'something'),
                data: lastWatchedShowRecommendation.rows,
            },
            { title: 'Top Rated Movies', data: topRated.rows },
            { title: 'Most Watched Movies', data: mostWatched.rows },
            { title: 'Top Rated Shows', data: topRatedShows.rows },
            { title: 'Most Watched Shows', data: mostWatchedShows.rows },
        ];

        res.status(200).json(suggestions);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

const newAndPopular = async (req, res, next) => {
    const { email } = req.query;

    try {
        const newMovies = await database.simpleExecute(
            `SELECT movie_id, title, description, video_url, image_url,
                    EXTRACT(YEAR FROM release_date) AS release_date,
                    ROUND((total_votes * rating / (total_votes + 10000))
                          + (10000 * (SELECT AVG(rating) FROM movie) / (total_votes + 10000)), 2) AS rating
             FROM movie
             WHERE release_date <= NOW()
             ORDER BY release_date DESC
             LIMIT 50`
        );

        const newShows = await database.simpleExecute(
            `SELECT show_id, title, description, image_url, video_url,
                    EXTRACT(YEAR FROM start_date) AS start_year,
                    ROUND((total_votes * rating / (total_votes + 10000))
                          + (10000 * (SELECT AVG(rating) FROM show) / (total_votes + 10000)), 2) AS rating
             FROM show
             WHERE start_date <= NOW()
             ORDER BY start_date DESC
             LIMIT 50`
        );

        const upcomingMovies = await database.simpleExecute(
            `SELECT movie_id, title, description, image_url,
                    EXTRACT(YEAR FROM release_date) AS release_date,
                    ROUND((total_votes * rating / (total_votes + 10000))
                          + (10000 * (SELECT AVG(rating) FROM movie) / (total_votes + 10000)), 2) AS rating
             FROM movie
             WHERE release_date > NOW()
             ORDER BY release_date DESC
             LIMIT 50`
        );

        const upcomingShows = await database.simpleExecute(
            `SELECT show_id, title, description, image_url,
                    EXTRACT(YEAR FROM start_date) AS release_date,
                    ROUND((total_votes * rating / (total_votes + 10000))
                          + (10000 * (SELECT AVG(rating) FROM show) / (total_votes + 10000)), 2) AS rating
             FROM show
             WHERE start_date > NOW()
             ORDER BY start_date DESC
             LIMIT 50`
        );

        const userCountry = await database.simpleExecute(
            'SELECT country FROM user_netflix WHERE email = :email',
            { email }
        );

        const regionMovie = await database.simpleExecute(
            `SELECT * FROM (
                SELECT m.movie_id, m.title, m.rating, m.image_url, m.description,
                       EXTRACT(YEAR FROM m.release_date) AS release_date
                FROM movie m
                JOIN movie_watch mw ON m.movie_id = mw.movie_id
                JOIN user_netflix u ON mw.email = u.email
                WHERE mw.time > NOW() - INTERVAL '7 days'
                  AND u.country = (SELECT country FROM user_netflix WHERE email = :email)
                GROUP BY m.movie_id, m.title, m.rating, m.image_url, m.description, m.release_date
                ORDER BY COUNT(*) DESC
                LIMIT 10
            ) rm`,
            { email }
        );

        const regionShow = await database.simpleExecute(
            `SELECT s.show_id, s.title, s.description, s.rating, s.image_url,
                    (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date
             FROM show s
             WHERE s.show_id IN (
                 SELECT s.show_id
                 FROM show s
                 JOIN episode_watch ew ON s.show_id = ew.show_id
                 JOIN user_netflix u ON ew.email = u.email
                 WHERE u.country = (SELECT country FROM user_netflix WHERE email = :email)
                   AND ew.time > NOW() - INTERVAL '7 days'
                 GROUP BY s.show_id
             )`,
            { email }
        );

        const globalMovie = await database.simpleExecute(
            `SELECT * FROM (
                SELECT m.movie_id, m.title, m.rating, m.image_url, m.description,
                       EXTRACT(YEAR FROM m.release_date) AS release_date
                FROM movie m
                JOIN movie_watch mw ON m.movie_id = mw.movie_id
                WHERE mw.time > NOW() - INTERVAL '7 days'
                GROUP BY m.movie_id, m.title, m.rating, m.image_url, m.description, m.release_date
                ORDER BY COUNT(*) DESC
                LIMIT 10
            ) gm`
        );

        const globalShow = await database.simpleExecute(
            `SELECT s.show_id, s.title, s.description, s.rating, s.image_url,
                    (EXTRACT(YEAR FROM s.start_date) || ' - ' || EXTRACT(YEAR FROM s.end_date)) AS release_date
             FROM show s
             WHERE s.show_id IN (
                 SELECT s.show_id
                 FROM show s
                 JOIN episode_watch ew ON s.show_id = ew.show_id
                 WHERE ew.time > NOW() - INTERVAL '7 days'
                 GROUP BY s.show_id
             )`
        );

        const country = userCountry.rows[0]?.COUNTRY || 'your region';
        const response = [
            { title: 'Top 10 Movies in ' + country, data: regionMovie.rows },
            { title: 'Top 10 Shows in ' + country, data: regionShow.rows },
            { title: 'Trending Movies ', data: globalMovie.rows },
            { title: 'Trending Shows ', data: globalShow.rows },
            { title: 'New Movies', data: newMovies.rows },
            { title: 'New Shows', data: newShows.rows },
            { title: 'Upcoming Movies', data: upcomingMovies.rows },
            { title: 'Upcoming Shows', data: upcomingShows.rows },
        ];

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};

const similarity = async (req, res, next) => {
    const { type } = req.query;
    if (type === 'movie') {
        try {
            const result = await database.simpleExecute(
                'SELECT movie_id, description FROM movie WHERE description IS NOT NULL'
            );
            await cosine_similarity.main(result.rows, type);
            res.status(200).json({ message: 'Similarity Calculation successful for movies' });
        } catch (err) {
            console.log(err);
            res.status(401).json({ message: 'Similarity error' });
        }
    } else if (type === 'show') {
        try {
            const result = await database.simpleExecute(
                'SELECT show_id, description FROM show WHERE description IS NOT NULL'
            );
            await cosine_similarity.main(result.rows, type);
            res.status(200).json({ message: 'Similarity Calculation successful for shows' });
        } catch (err) {
            console.log(err);
            res.status(401).json({ message: 'Similarity error' });
        }
    }
};

const getGenres = async (req, res, next) => {
    const { movie_id, show_id } = req.query;

    try {
        let result;
        if (movie_id) {
            const movies = await database.simpleExecute(
                `SELECT g.name, m.total_views, m.total_votes
                 FROM movie m
                 JOIN movie_genre mg ON m.movie_id = mg.movie_id
                 JOIN genre g ON g.genre_id = mg.genre_id
                 WHERE m.movie_id = :movie_id`,
                { movie_id }
            );
            result = movies.rows;
        } else {
            const shows = await database.simpleExecute(
                `SELECT g.name, s.total_views, s.total_votes
                 FROM show s
                 JOIN show_genre sg ON s.show_id = sg.show_id
                 JOIN genre g ON g.genre_id = sg.genre_id
                 WHERE s.show_id = :show_id`,
                { show_id }
            );
            result = shows.rows;
        }
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Getting genre failed' });
    }
};

const getCelebs = async (req, res, next) => {
    const { movie_id, show_id } = req.query;

    try {
        if (movie_id) {
            const celebs = await database.simpleExecute(
                `SELECT m.title, c.name
                 FROM movie m
                 JOIN movie_celeb mc ON m.movie_id = mc.movie_id
                 JOIN celeb c ON c.celeb_id = mc.celeb_id
                 WHERE m.movie_id = :movie_id
                 LIMIT 5`,
                { movie_id }
            );
            res.status(200).json(celebs.rows);
        } else {
            const celebs = await database.simpleExecute(
                `SELECT s.title, c.name
                 FROM show s
                 JOIN show_celeb sc ON s.show_id = sc.show_id
                 JOIN celeb c ON c.celeb_id = sc.celeb_id
                 WHERE s.show_id = :show_id
                 LIMIT 5`,
                { show_id }
            );
            res.status(200).json(celebs.rows);
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Celeb error' });
    }
};

const getSimilar = async (req, res, next) => {
    const { movie_id, show_id } = req.query;

    try {
        if (movie_id) {
            const movies = await database.simpleExecute(
                `SELECT * FROM (
                    SELECT m2.movie_id, ms.score, m2.title, m2.description, m2.image_url, m2.video_url, m2.rating,
                           EXTRACT(YEAR FROM m2.release_date) AS release_date
                    FROM movie m1
                    JOIN movie_similarity ms ON m1.movie_id = ms.movie_id1
                    JOIN movie m2 ON m2.movie_id = ms.movie_id2
                    WHERE ms.score < 1 AND ms.score > 0.05 AND m1.movie_id = :movie_id
                    ORDER BY ms.score DESC
                    LIMIT 5
                ) sim`,
                { movie_id }
            );
            res.status(200).json(movies.rows);
        } else {
            const shows = await database.simpleExecute(
                `SELECT * FROM (
                    SELECT s2.show_id, ss.score, s2.title, s2.description, s2.image_url, s2.rating,
                           (EXTRACT(YEAR FROM s2.start_date) || ' - ' || EXTRACT(YEAR FROM s2.end_date)) AS release_date
                    FROM show s1
                    JOIN show_similarity ss ON s1.show_id = ss.show_id1
                    JOIN show s2 ON s2.show_id = ss.show_id2
                    WHERE ss.score < 1 AND ss.score > 0.05 AND s1.show_id = :show_id
                    ORDER BY ss.score DESC
                    LIMIT 5
                ) sim`,
                { show_id }
            );
            res.status(200).json(shows.rows);
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Couldnt find similar content' });
    }
};

exports.getMovieByGenre = getMovieByGenre;
exports.getShowByGenre = getShowByGenre;
exports.search = search;
exports.getEpisodes = getEpisodes;
exports.getSuggestions = getSuggestions;
exports.similarity = similarity;
exports.newAndPopular = newAndPopular;
exports.getGenres = getGenres;
exports.getCelebs = getCelebs;
exports.getSimilar = getSimilar;
