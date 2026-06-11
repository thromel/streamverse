const database = require('./database');

const SUB_TYPE_MAP = {
    BAS: 'BASIC',
    STA: 'STANDARD',
    PRE: 'PREMIUM',
    BASIC: 'BASIC',
    STANDARD: 'STANDARD',
    PREMIUM: 'PREMIUM',
};

function monthsBetween(startDate, endDate = new Date()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

async function expireSubscriptions(email) {
    await database.simpleExecute(
        `UPDATE subscription
         SET running = 0,
             total_bill = ROUND(
                 (EXTRACT(YEAR FROM AGE(NOW(), start_date)) * 12
                  + EXTRACT(MONTH FROM AGE(NOW(), start_date))) * bill,
                 2
             )
         WHERE email = :email AND end_date < NOW() AND running = 1`,
        { email }
    );
}

async function terminateRunningSubscription(email) {
    await database.simpleExecute(
        `UPDATE subscription
         SET running = 0,
             termination_date = NOW(),
             total_bill = ROUND(
                 (EXTRACT(YEAR FROM AGE(NOW(), start_date)) * 12
                  + EXTRACT(MONTH FROM AGE(NOW(), start_date))) * bill,
                 2
             )
         WHERE email = :email AND running = 1`,
        { email }
    );
}

async function getSubscriptionPlan(subType) {
    const normalized = SUB_TYPE_MAP[subType] || subType;
    const result = await database.simpleExecute(
        `SELECT bill, num_profiles FROM subscription_type WHERE sub_type = :sub_type`,
        { sub_type: normalized }
    );
    if (result.rows.length === 0) {
        return { bill: 10, num_profiles: 6 };
    }
    return {
        bill: Number(result.rows[0].BILL),
        num_profiles: Number(result.rows[0].NUM_PROFILES),
    };
}

async function applySubscriptionBilling(email, subType) {
    const plan = await getSubscriptionPlan(subType);
    await database.simpleExecute(
        `UPDATE user_netflix SET max_profiles = :num_profiles WHERE email = :email`,
        { email, num_profiles: plan.num_profiles }
    );
    return plan.bill;
}

module.exports = {
    monthsBetween,
    expireSubscriptions,
    terminateRunningSubscription,
    getSubscriptionPlan,
    applySubscriptionBilling,
    SUB_TYPE_MAP,
};
