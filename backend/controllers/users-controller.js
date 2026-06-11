const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../services/database');
const config = require('../config');

const getUsers = async (req, res, next) => {
    try {
        const result = await database.simpleExecute('SELECT * FROM user_netflix');
        res.status(200).json({ users: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid Input', 422);
        return next(error);
    }

    let { NAME, EMAIL, DOB, COUNTRY, CREDIT_CARD, PASSWORD, PHONE } = req.body;

    try {
        const hasUser = await database.simpleExecute(
            'SELECT * FROM user_netflix WHERE email = :email',
            { email: EMAIL }
        );

        if (hasUser.rows.length !== 0) {
            return next(new HttpError('User exists already, please login instead.', 423));
        }
    } catch (err) {
        console.log(err);
    }

    try {
        PASSWORD = await bcrypt.hash(PASSWORD, 12);

        await database.simpleExecute(
            `INSERT INTO user_netflix (name, password, email, dob, country, credit_card, phone)
             VALUES (:uname, :pw, :email, :dob, :cid, :cred, :phone)`,
            {
                uname: NAME,
                pw: PASSWORD,
                email: EMAIL,
                dob: DOB,
                cid: COUNTRY,
                cred: CREDIT_CARD,
                phone: PHONE,
            }
        );

        const token = jwt.sign({ EMAIL }, config.jwtSecret, { expiresIn: '1h' });
        res.status(201).json({ EMAIL, token });
    } catch (err) {
        console.log(err);
        return next(new HttpError(err.message || 'Signup failed', 424));
    }
};

const login = async (req, res, next) => {
    const { EMAIL, PASSWORD } = req.body;

    const identifiedUser = await database.simpleExecute(
        'SELECT password FROM user_netflix WHERE email = :email',
        { email: EMAIL }
    );

    if (!identifiedUser || identifiedUser.rows.length === 0) {
        return next(new HttpError('User does not exist. Please sign up instead', 422));
    }

    const { PASSWORD: hashedPassword } = identifiedUser.rows[0];
    if (await bcrypt.compare(PASSWORD, hashedPassword)) {
        const token = jwt.sign({ EMAIL }, config.jwtSecret, { expiresIn: '1h' });
        res.status(201).json({ EMAIL, token });
    } else {
        return next(new HttpError('Incorrect Password', 423));
    }
};

const getMaxProfiles = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(
            'SELECT max_profiles FROM user_netflix WHERE email = :email',
            { email: EMAIL }
        );
        res.status(200).json({ mp: result.rows[0] });
    } catch (err) {
        console.log(err);
    }
};

const updatePhone = async (req, res, next) => {
    const { EMAIL, Phone } = req.body;
    try {
        await database.simpleExecute(
            'UPDATE user_netflix SET phone = :phone WHERE email = :email',
            { email: EMAIL, phone: Phone }
        );
        res.status(201).json({ message: 'Successfully updated phone' });
    } catch (err) {
        console.log(err);
    }
};

const getPhone = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(
            'SELECT phone FROM user_netflix WHERE email = :email',
            { email: EMAIL }
        );
        res.status(200).json({ phone: result.rows[0] });
    } catch (err) {
        console.log(err);
    }
};

const updatePassword = async (req, res, next) => {
    const { EMAIL, OLD_PASS, NEW_PASS, NEW_PASS_CON } = req.body;

    if (NEW_PASS !== NEW_PASS_CON) {
        return next(new HttpError("New passwords don't match", 422));
    }

    try {
        const result = await database.simpleExecute(
            'SELECT password FROM user_netflix WHERE email = :email',
            { email: EMAIL }
        );
        const { PASSWORD: hashedPassword } = result.rows[0];
        if (await bcrypt.compare(OLD_PASS, hashedPassword)) {
            const PASSWORD2 = await bcrypt.hash(NEW_PASS, 12);
            await database.simpleExecute(
                'UPDATE user_netflix SET password = :pw WHERE email = :email',
                { email: EMAIL, pw: PASSWORD2 }
            );
            res.status(201).json({ message: 'password updated successfully' });
        } else {
            return next(new HttpError('Incorrect Password', 423));
        }
    } catch (err) {
        console.log(err);
    }
};

const getMovieWatchHistory = async (req, res, next) => {
    const EMAIL = req.params.email;
    const PROF_ID = req.params.prof_id;
    try {
        const result = await database.simpleExecute(
            `SELECT mw.rating, mw.watched_upto, m.title, mw.time, m.image_url
             FROM movie_watch mw
             JOIN movie m ON m.movie_id = mw.movie_id
             WHERE mw.email = :email AND mw.profile_id = :prof_id
             ORDER BY mw.time DESC`,
            { email: EMAIL, prof_id: PROF_ID }
        );
        res.status(200).json({ history: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const getMovieWatchHistory2 = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(
            `SELECT mw.rating, mw.watched_upto, m.title, mw.time, m.image_url, mw.profile_id AS pid
             FROM movie_watch mw
             JOIN movie m ON m.movie_id = mw.movie_id
             WHERE mw.email = :email
             ORDER BY mw.time DESC`,
            { email: EMAIL }
        );
        res.status(200).json({ history: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const getShowWatchHistory = async (req, res, next) => {
    const EMAIL = req.params.email;
    const PROF_ID = req.params.prof_id;
    try {
        const result = await database.simpleExecute(
            `SELECT s.title, s.rating, e.season_no, e.episode_no, e.watched_upto
             FROM episode_watch e
             JOIN show s ON s.show_id = e.show_id
             WHERE e.email = :email AND e.profile_id = :prof_id`,
            { email: EMAIL, prof_id: PROF_ID }
        );
        res.status(200).json({ history: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const getShowWatchHistory2 = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(
            `SELECT s.title, s.rating, e.season_no, e.episode_no, e.watched_upto, e.profile_id AS pid
             FROM episode_watch e
             JOIN show s ON s.show_id = e.show_id
             WHERE e.email = :email`,
            { email: EMAIL }
        );
        res.status(200).json({ history: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const getNumProfiles = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(
            'SELECT COUNT(*) AS c FROM profile WHERE email = :email',
            { email: EMAIL }
        );
        res.status(200).json({ C: result.rows[0] });
    } catch (err) {
        console.log(err);
    }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getMaxProfiles = getMaxProfiles;
exports.updatePhone = updatePhone;
exports.getPhone = getPhone;
exports.updatePassword = updatePassword;
exports.getMovieWatchHistory = getMovieWatchHistory;
exports.getMovieWatchHistory2 = getMovieWatchHistory2;
exports.getShowWatchHistory = getShowWatchHistory;
exports.getShowWatchHistory2 = getShowWatchHistory2;
exports.getNumProfiles = getNumProfiles;
