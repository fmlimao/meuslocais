const redis = require('promise-redis')();
const redisExpire = process.env.REDIS_EXPIRE;
const local = process.env.REDIS_LOCAL;

let client = null;

if (local == '1') {
    client = redis.createClient();
} else {
    client = redis.createClient({
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
    });
}

async function set(k, v) {
    return await client.set(k, JSON.stringify(v), 'EX', redisExpire);
};

async function get(k) {
    return JSON.parse(await client.get(k));
};

module.exports = {
    set,
    get,
};
