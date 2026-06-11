const database = require('./database');

async function updateMovieRatingOnInsert(movieId, newRating) {
    const rating = newRating ?? 0;
    await database.simpleExecute(
        `UPDATE movie
         SET rating = ((rating * total_votes) + :rating) / (total_votes + 1),
             total_votes = total_votes + 1,
             total_views = total_views + 1
         WHERE movie_id = :movie_id`,
        { movie_id: movieId, rating }
    );
}

async function updateMovieRatingOnUpdate(movieId, newRating, oldRating) {
    await database.simpleExecute(
        `UPDATE movie
         SET rating = ((rating * total_votes) + :new_rating - :old_rating) / NULLIF(total_votes, 0)
         WHERE movie_id = :movie_id`,
        { movie_id: movieId, new_rating: newRating, old_rating: oldRating ?? 0 }
    );
}

async function updateShowRatingOnInsert(showId, newRating) {
    const rating = newRating ?? 0;
    await database.simpleExecute(
        `UPDATE show
         SET rating = ((rating * total_votes) + :rating) / (total_votes + 1),
             total_votes = total_votes + 1,
             total_views = total_views + 1
         WHERE show_id = :show_id`,
        { show_id: showId, rating }
    );
}

async function updateShowRatingOnUpdate(showId, newRating, oldRating) {
    await database.simpleExecute(
        `UPDATE show
         SET rating = ((rating * total_votes) + :new_rating - :old_rating) / NULLIF(total_votes, 0)
         WHERE show_id = :show_id`,
        { show_id: showId, new_rating: newRating, old_rating: oldRating ?? 0 }
    );
}

module.exports = {
    updateMovieRatingOnInsert,
    updateMovieRatingOnUpdate,
    updateShowRatingOnInsert,
    updateShowRatingOnUpdate,
};
