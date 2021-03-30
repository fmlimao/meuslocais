const connRead = require('../database/conn-read');
// const connWrite = require('../database/conn-write');
const JsonReturn = require('../helpers/json-return');
const errorHandler = require('../helpers/error-handler');
// const validator = require('../helpers/validator');

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
                    FROM users
                    WHERE deleted_at IS NULL
                    AND active = 1
                    ${where.length ? `AND ${where.join(' AND ')}` : 'AND 1 = 0'}
                    ;
                `, values);

                // if (!user) {
                //     ret.setError(true);
                //     ret.setCode(404);
                //     ret.addMessage('Usuário não encontrada.');
                //     return reject(ret);
                // }

                ret.addContent('user', user);

                resolve(ret.generate());
            } catch (err) {
                ret = errorHandler(err, ret);
                reject(ret);
            }
        });

    }

    // static create(fields) {

    //     return new Promise((resolve, reject) => {
    //         const ret = new JsonReturn();

    //         ret.addFields(['Descricao', 'Origem']);

    //         const { Descricao, Origem } = fields;

    //         if (!validator(ret, {
    //             Descricao,
    //             Origem,
    //         }, {
    //             Descricao: 'required|string|min:3',
    //             Origem: 'required|integer|between:2,3',
    //         })) {
    //             ret.setError(true);
    //             ret.setCode(400);
    //             ret.addMessage('Verifique todos os campos.');
    //             return reject(ret);
    //         }

    //         const next = {
    //             Descricao,
    //             Origem,
    //             ret,
    //         };

    //         resolve(next);
    //     })
    //         .then(async next => {
    //             const areaExists = await connRead.getOne(`
    //                 SELECT D001_AreasID
    //                 FROM D001_Areas
    //                 WHERE Deleted_at IS NULL
    //                 AND Status = 1
    //                 AND Origem = ?
    //                 AND Descricao = ?;
    //             `, [
    //                 next.Origem,
    //                 next.Descricao,
    //             ]);

    //             if (areaExists) {
    //                 next.ret.setFieldError('Descricao', true, 'Já existe uma área com esta descrição.');

    //                 next.ret.setError(true);
    //                 next.ret.setCode(400);
    //                 next.ret.addMessage('Verifique todos os campos.');

    //                 throw next.ret;
    //             }

    //             return next;
    //         })
    //         .then(async next => {
    //             const D001_AreasID = await connWrite.insert(`
    //                 INSERT INTO D001_Areas (Descricao, Origem, Status, Author)
    //                 VALUES (?, ?, 1, 1);
    //             `, [
    //                 next.Descricao,
    //                 next.Origem,
    //             ]);

    //             return this.findOne({ D001_AreasID });
    //         });

    // }

    // static update(D001_AreasID, fields) {

    //     return this.findOne({ D001_AreasID })
    //         .then(async findRet => {
    //             const area = findRet.content.area;

    //             const ret = new JsonReturn();

    //             ret.addFields(['Descricao']);

    //             const { Descricao } = fields;

    //             if (!validator(ret, {
    //                 Descricao,
    //             }, {
    //                 Descricao: 'string|min:3',
    //             })) {
    //                 ret.setError(true);
    //                 ret.setCode(400);
    //                 ret.addMessage('Verifique todos os campos.');
    //                 throw ret;
    //             }

    //             const next = {
    //                 Descricao,
    //                 area,
    //                 ret,
    //             };

    //             return next;
    //         })
    //         .then(async next => {
    //             if (next.Descricao) {
    //                 const areaExists = await connRead.getOne(`
    //                     SELECT D001_AreasID
    //                     FROM D001_Areas
    //                     WHERE Deleted_at IS NULL
    //                     AND Status = 1
    //                     AND Origem = ?
    //                     AND Descricao = ?
    //                     AND D001_AreasID != ?;
    //                 `, [
    //                     next.area.Origem,
    //                     next.Descricao,
    //                     D001_AreasID,
    //                 ]);

    //                 if (areaExists) {
    //                     next.ret.setFieldError('Descricao', true, 'Já existe uma área com esta descrição.');

    //                     next.ret.setError(true);
    //                     next.ret.setCode(400);
    //                     next.ret.addMessage('Verifique todos os campos.');

    //                     throw next.ret;
    //                 }
    //             }

    //             return next;
    //         })
    //         .then(next => {
    //             if (next.Descricao) next.area.Descricao = next.Descricao;

    //             return next;
    //         })
    //         .then(async next => {
    //             await connWrite.update(`
    //                 UPDATE D001_Areas
    //                 SET Descricao = ?
    //                 WHERE D001_AreasID = ?;
    //             `, [
    //                 next.area.Descricao,
    //                 D001_AreasID,
    //             ]);

    //             return this.findOne({
    //                 D001_AreasID,
    //             });
    //         });

    // }

    // static remove(D001_AreasID) {

    //     return this.findOne({ D001_AreasID })
    //         .then(() => {
    //             return connWrite.update(`
    //                 UPDATE D001_Areas
    //                 SET Status = 0, Deleted_at = NOW()
    //                 WHERE D001_AreasID = ?;
    //             `, [
    //                 D001_AreasID,
    //             ]);
    //         });

    // }

}

module.exports = UsersRepository;
