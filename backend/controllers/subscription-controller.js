const database = require('../services/database');
const {
    expireSubscriptions,
    terminateRunningSubscription,
    applySubscriptionBilling,
} = require('../services/subscription-utils');

const addSubscription = async (req, res, next) => {
    const { SUB_TYPE, EMAIL, END_DATE } = req.body;
    const TERMINATION_DATE = END_DATE;
    const RUNNING = 1;

    try {
        await terminateRunningSubscription(EMAIL);

        const bill = await applySubscriptionBilling(EMAIL, SUB_TYPE);

        await database.simpleExecute(
            `INSERT INTO subscription (sub_type, email, end_date, termination_date, running, bill)
             VALUES (:sub_type, :email, :end_date, :termination_date, :running, :bill)`,
            {
                sub_type: SUB_TYPE,
                email: EMAIL,
                end_date: END_DATE,
                termination_date: TERMINATION_DATE,
                running: RUNNING,
                bill,
            }
        );
        res.status(201).json({ message: 'Successfully added subscription' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Failed to add subscription to database' });
    }
};

const getSubId = async (req, res, next) => {
    const Email = req.params.email;

    try {
        await expireSubscriptions(Email);

        const result = await database.simpleExecute(
            'SELECT sub_id FROM subscription WHERE email = :email AND running = 1',
            { email: Email }
        );

        res.status(200).json({ sub_id: result.rows[0] });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Cannot get sub_id from database' });
    }
};

const getBill = async (req, res, next) => {
    const subid = req.params.sub_id;

    try {
        const result = await database.simpleExecute(
            'SELECT bill FROM subscription WHERE sub_id = :sub_id',
            { sub_id: subid }
        );
        res.status(200).json({ bill: result.rows[0] });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Cannot get bill from database' });
    }
};

const getSubscriptions = async (req, res, next) => {
    try {
        const result = await database.simpleExecute('SELECT * FROM subscription');
        res.status(200).json({ users: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const getHistory = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(
            `SELECT sub_type,
                    TO_CHAR(start_date, 'DD/MM/YYYY') AS s_date,
                    TO_CHAR(termination_date, 'DD/MM/YYYY') AS t_date,
                    total_bill
             FROM subscription
             WHERE running = 0 AND email = :email
             ORDER BY termination_date`,
            { email: EMAIL }
        );
        res.status(200).json({ history: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const updateSubscription = async (req, res, next) => {
    const { SUB_ID, SUB_TYPE, END_DATE } = req.body;

    try {
        const bill = await applySubscriptionBilling(
            (await database.simpleExecute(
                'SELECT email FROM subscription WHERE sub_id = :sub_id LIMIT 1',
                { sub_id: SUB_ID }
            )).rows[0]?.EMAIL,
            SUB_TYPE
        );

        await database.simpleExecute(
            `UPDATE subscription
             SET sub_type = :sub_type, end_date = :end_date, bill = :bill
             WHERE sub_id = :sub_id`,
            {
                sub_type: SUB_TYPE,
                end_date: END_DATE,
                sub_id: SUB_ID,
                bill,
            }
        );
        res.status(201).json({ message: 'Successfully updated subscription' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Failed to update subscription' });
    }
};

const deleteSubscription = async (req, res, next) => {
    const { EMAIL } = req.body;

    try {
        await terminateRunningSubscription(EMAIL);
        await database.simpleExecute(
            'DELETE FROM profile WHERE email = :email',
            { email: EMAIL }
        );
        res.status(201).json({ message: 'Successfully deleted subscription' });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Failed to delete subscription' });
    }
};

const isValidSubscription = async (req, res, next) => {
    const sub_id = req.params.sub_id;
    let valid = 0;
    try {
        const result = await database.simpleExecute(
            'SELECT * FROM subscription WHERE sub_id = :sub_id AND running = 0',
            { sub_id }
        );
        valid = result.rows.length === 0 ? 1 : 0;
        res.status(200).json({ VALID: valid });
    } catch (err) {
        console.log(err);
    }
};

const getplans = async (req, res, next) => {
    try {
        const result = await database.simpleExecute('SELECT * FROM subscription_type');
        res.status(200).json({ plans: result.rows });
    } catch (err) {
        console.log(err);
    }
};

const getEndDate = async (req, res, next) => {
    const EMAIL = req.params.email;
    try {
        const result = await database.simpleExecute(
            `SELECT TO_CHAR(end_date, 'FMMonth DD, YYYY') AS ed
             FROM subscription
             WHERE running = 1 AND email = :email`,
            { email: EMAIL }
        );
        res.status(200).json({ ed: result.rows[0] });
    } catch (err) {
        console.log(err);
    }
};

exports.getSubscriptions = getSubscriptions;
exports.addSubscription = addSubscription;
exports.updateSubscription = updateSubscription;
exports.deleteSubscription = deleteSubscription;
exports.getSubId = getSubId;
exports.isValidSubscription = isValidSubscription;
exports.getBill = getBill;
exports.getHistory = getHistory;
exports.getplans = getplans;
exports.getEndDate = getEndDate;
