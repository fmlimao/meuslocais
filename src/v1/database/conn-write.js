const knex = require('knex');
const Sql = require('../helpers/sql');

const connection = knex({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST_WRITE,
        database: process.env.DB_NAME_WRITE,
        user: process.env.DB_USER_WRITE,
        password: process.env.DB_PASS_WRITE,
        charset: 'utf8',
        dateStrings: true,
    },
    useNullAsDefault: true,
});

module.exports = new Sql(connection);
