const bcrypt = require('bcrypt');
const connRead = require('../database/conn-read');
const connWrite = require('../database/conn-write');
const JsonReturn = require('../helpers/json-return');
const errorHandler = require('../helpers/error-handler');
const validator = require('../helpers/validator');

class UsersRepository {

    static findAll({ filter }) {

        return new Promise(resolve => {
            const queryOptions = connRead.generateOptions(filter);

            const querySearch = queryOptions.searchValue.length ? ` AND (${[
                `user_id LIKE '%${queryOptions.searchValue}%'`,
                `name LIKE '%${queryOptions.searchValue}%'`,
                `email LIKE '%${queryOptions.searchValue}%'`,
                `created_at LIKE '%${queryOptions.searchValue}%'`,
                `DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') LIKE '%${queryOptions.searchValue}%'`,
            ].join(' OR ')})` : '';

            const next = {
                filter,
                queryOptions,
                querySearch,
            };

            resolve(next);
        })
            .then(async next => {
                next.totalCount = (await connRead.getOne(`
                    SELECT COUNT(user_id) AS total
                    FROM users
                    WHERE deleted_at IS NULL
                    AND active = 1;
                `)).total;

                return next;
            })
            .then(async next => {
                next.filteredCount = (await connRead.getOne(`
                    SELECT COUNT(user_id) AS total
                    FROM users
                    WHERE deleted_at IS NULL
                    AND active = 1
                    ${next.querySearch}
                    ;
                `)).total;

                return next;
            })
            .then(async next => {
                next.users = await connRead.getAll(`
                    SELECT
                        user_id
                        , name
                        , email
                        , password
                        , salt
                        , active
                        , created_at
                    FROM users
                    WHERE deleted_at IS NULL
                    AND active = 1
                    ${next.querySearch}
                    ${next.queryOptions.orderBy ? next.queryOptions.orderBy : 'ORDER BY name'}
                    ${next.queryOptions.limit ? next.queryOptions.limit : ''}
                    ;
                `);

                return next;
            })
            .then(async next => {
                const ret = new JsonReturn();

                ret.addContent('totalCount', next.totalCount);
                ret.addContent('filteredCount', next.filteredCount);
                ret.addContent('users', next.users);

                return ret.generate();
            });

    }

    static findOne({ user_id, email }) {

        return new Promise(async (resolve, reject) => {
            let ret = new JsonReturn();

            try {
                const where = [];
                const values = [];

                if (typeof user_id !== 'undefined') {
                    where.push(`user_id = ?`);
                    values.push(user_id);
                }

                if (typeof email !== 'undefined') {
                    where.push(`email = ?`);
                    values.push(email);
                }

                const user = await connRead.getOne(`
                    SELECT
                        user_id
                        , name
                        , email
                        , password
                        , salt
                        , active
                        , created_at
                    FROM users
                    WHERE deleted_at IS NULL
                    AND active = 1
                    ${where.length ? `AND ${where.join(' AND ')}` : 'AND 1 = 0'}
                    ;
                `, values);

                ret.addContent('user', user);

                resolve(ret.generate());
            } catch (err) {
                ret = errorHandler(err, ret);
                reject(ret);
            }
        });

    }

    static findOneWithoutActive({ user_id, email }) {

        return new Promise(async (resolve, reject) => {
            let ret = new JsonReturn();

            try {
                const where = [];
                const values = [];

                if (typeof user_id !== 'undefined') {
                    where.push(`user_id = ?`);
                    values.push(user_id);
                }

                if (typeof email !== 'undefined') {
                    where.push(`email = ?`);
                    values.push(email);
                }

                const user = await connRead.getOne(`
                    SELECT
                        user_id
                        , name
                        , email
                        , password
                        , salt
                        , active
                        , created_at
                    FROM users
                    WHERE deleted_at IS NULL
                    ${where.length ? `AND ${where.join(' AND ')}` : 'AND 1 = 0'}
                    ;
                `, values);

                ret.addContent('user', user);

                resolve(ret.generate());
            } catch (err) {
                ret = errorHandler(err, ret);
                reject(ret);
            }
        });

    }

    static create(fields) {

        return new Promise((resolve, reject) => {
            const ret = new JsonReturn();

            ret.addFields(['name', 'email', 'password']);

            const { name, email, password } = fields;

            if (!validator(ret, {
                name,
                email,
                password,
            }, {
                name: 'required|string|min:3|max:128',
                email: 'required|string|email|max:128',
                password: 'required|string|max:32',
            })) {
                ret.setError(true);
                ret.setCode(400);
                ret.addMessage('Verifique todos os campos.');
                return reject(ret);
            }

            const next = {
                name,
                email,
                password,
                ret,
            };

            resolve(next);
        })
            .then(async next => {
                const userExists = await connRead.getOne(`
                    SELECT user_id
                    FROM users
                    WHERE deleted_at IS NULL
                    AND active = 1
                    AND email = ?;
                `, [
                    next.email,
                ]);

                if (userExists) {
                    next.ret.setFieldError('email', true, 'Já existe um usuário com esta e-mail.');

                    next.ret.setError(true);
                    next.ret.setCode(400);
                    next.ret.addMessage('Verifique todos os campos.');

                    throw next.ret;
                }

                return next;
            })
            .then(async next => {
                next.saltLength = Number(process.env.AUTH_SALT_LENGTH);
                next.salt = bcrypt.genSaltSync(next.saltLength);
                next.newPassword = bcrypt.hashSync(next.password, next.salt);

                return next;
            })
            .then(async next => {
                const user_id = await connWrite.insert(`
                    INSERT INTO users (name, email, password, salt, active)
                    VALUES (?, ?, ?, ?, 1);
                `, [
                    next.name,
                    next.email,
                    next.newPassword,
                    next.salt,
                ]);

                return this.findOne({ user_id });
            });

    }

    static update(user_id, fields) {

        return this.findOne({ user_id })
            .then(async findRet => {
                const user = findRet.content.user;

                const ret = new JsonReturn();

                ret.addFields(['name', 'email', 'password']);

                const { name, email, password } = fields;

                if (!validator(ret, {
                    name,
                    email,
                    password,
                }, {
                    name: 'string|min:3|max:128',
                    email: 'string|email|max:128',
                    password: 'string|max:32',
                })) {
                    ret.setError(true);
                    ret.setCode(400);
                    ret.addMessage('Verifique todos os campos.');
                    throw ret;
                }

                const next = {
                    name,
                    email,
                    password,
                    user,
                    ret,
                };

                return next;
            })
            .then(async next => {
                if (next.email) {
                    const userExists = await connRead.getOne(`
                        SELECT user_id
                        FROM users
                        WHERE deleted_at IS NULL
                        AND active = 1
                        AND email = ?
                        AND user_id != ?;
                    `, [
                        next.email,
                        user_id,
                    ]);

                    if (userExists) {
                        next.ret.setFieldError('email', true, 'Já existe um usuário com este e-mail.');

                        next.ret.setError(true);
                        next.ret.setCode(400);
                        next.ret.addMessage('Verifique todos os campos.');

                        throw next.ret;
                    }
                }

                return next;
            })
            .then(next => {
                if (typeof next.name !== 'undefined') next.user.name = next.name;
                if (typeof next.email !== 'undefined') next.user.email = next.email;
                if (typeof next.password !== 'undefined') {
                    next.user.email = next.email;

                    next.saltLength = Number(process.env.AUTH_SALT_LENGTH);
                    next.user.salt = bcrypt.genSaltSync(next.saltLength);
                    next.user.password = bcrypt.hashSync(next.password, next.user.salt);
                }

                return next;
            })
            .then(async next => {
                await connWrite.update(`
                    UPDATE users
                    SET name = ?
                    , email = ?
                    , password = ?
                    , salt = ?
                    WHERE user_id = ?;
                `, [
                    next.user.name,
                    next.user.email,
                    next.user.password,
                    next.user.salt,
                    user_id,
                ]);

                return this.findOne({
                    user_id,
                });
            });

    }

    static active(user_id, active) {

        return this.findOneWithoutActive({ user_id })
            .then(async findRet => {
                const user = findRet.content.user;

                const ret = new JsonReturn();

                ret.addFields(['active']);

                if (!validator(ret, {
                    active,
                }, {
                    active: 'required|integer|between:0,1',
                })) {
                    ret.setError(true);
                    ret.setCode(400);
                    ret.addMessage('Verifique todos os campos.');
                    throw ret;
                }

                const next = {
                    active,
                    user,
                    ret,
                };

                return next;
            })
            .then(async next => {
                await connWrite.update(`
                    UPDATE users
                    SET active = ?
                    WHERE user_id = ?;
                `, [
                    next.active,
                    user_id,
                ]);

                return this.findOneWithoutActive({
                    user_id,
                });
            });

    }

    static remove(user_id) {

        return this.findOne({ user_id })
            .then(() => {
                return connWrite.update(`
                    UPDATE users
                    SET active = 0, deleted_at = NOW()
                    WHERE user_id = ?;
                `, [
                    user_id,
                ]);
            });

    }

}

module.exports = UsersRepository;
