const knex = require('knex');
const Sql = require('../helpers/sql');

const connection = knex({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST_READ,
        database: process.env.DB_NAME_READ,
        user: process.env.DB_USER_READ,
        password: process.env.DB_PASS_READ,
        charset: 'utf8',
        dateStrings: true,
    },
    useNullAsDefault: true,
});

module.exports = new Sql(connection);
