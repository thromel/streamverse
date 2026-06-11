const { Pool } = require('pg');
const config = require('../config');

let pool;

function uppercaseKeys(row) {
    if (!row || typeof row !== 'object') {
        return row;
    }
    const out = {};
    for (const [key, value] of Object.entries(row)) {
        out[key.toUpperCase()] = value;
    }
    return out;
}

function convertNamedBinds(statement, binds) {
    if (!binds || typeof binds !== 'object' || Array.isArray(binds)) {
        return { text: statement, values: Array.isArray(binds) ? binds : [] };
    }

    const order = [];
    const seen = new Map();
    const text = statement.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, name) => {
        if (!seen.has(name)) {
            seen.set(name, order.length + 1);
            order.push(name);
        }
        return `$${seen.get(name)}`;
    });

    const values = order.map((name) => binds[name]);
    return { text, values };
}

async function initialize() {
    pool = new Pool({ connectionString: config.databaseUrl });
    await pool.query('SELECT 1');
}

async function close() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

async function simpleExecute(statement, binds = [], opts = {}) {
    const client = await pool.connect();
    try {
        if (opts.autoCommit === false) {
            await client.query('BEGIN');
        }

        const { text, values } = convertNamedBinds(statement, binds);
        const result = await client.query(text, values);

        if (opts.autoCommit === false) {
            await client.query('COMMIT');
        }

        return {
            rows: result.rows.map(uppercaseKeys),
            rowCount: result.rowCount,
            outBinds: opts.outBinds || {},
        };
    } catch (err) {
        if (opts.autoCommit === false) {
            await client.query('ROLLBACK');
        }
        throw err;
    } finally {
        client.release();
    }
}

async function withTransaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const txExecute = async (statement, binds = []) => {
            const { text, values } = convertNamedBinds(statement, binds);
            const result = await client.query(text, values);
            return {
                rows: result.rows.map(uppercaseKeys),
                rowCount: result.rowCount,
            };
        };
        const result = await callback(txExecute, client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    initialize,
    close,
    simpleExecute,
    withTransaction,
    getPool: () => pool,
};
