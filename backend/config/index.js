require('dotenv').config();

module.exports = {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://streamverse:streamverse@localhost:5432/streamverse',
    port: parseInt(process.env.PORT, 10) || 5001,
    jwtSecret: process.env.JWT_SECRET || 'supersecret_dont_share',
    tmdbApiKey: process.env.TMDB_API_KEY || '',
};
