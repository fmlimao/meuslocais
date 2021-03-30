const connRead = require('../database/conn-read');
const connWrite = require('../database/conn-write');
const JsonReturn = require('../helpers/json-return');
const validator = require('../helpers/validator');

class SubareasRepository {

    static findAll({ filter }) {

        return new Promise(resolve => {
            const queryOptions = connRead.generateOptions(filter);

            const origem = filter.origem || 2;

            const querySearch = queryOptions.searchValue.length ? ` AND (${[
                `S.D001_SubareasID LIKE '%${queryOptions.searchValue}%'`,
                `A.Descricao LIKE '%${queryOptions.searchValue}%'`,
                `S.Descricao LIKE '%${queryOptions.searchValue}%'`,
                `A.Origem LIKE '%${queryOptions.searchValue}%'`,
                `IF(A.Origem = 2, 'GTF', 'Financeiro') LIKE '%${queryOptions.searchValue}%'`,
                `S.Created_at LIKE '%${queryOptions.searchValue}%'`,
                `DATE_FORMAT(S.Created_at, '%d/%m/%Y %H:%i:%s') LIKE '%${queryOptions.searchValue}%'`,
            ].join(' OR ')})` : '';

            const next = {
                filter,
                queryOptions,
                origem,
                querySearch,
            };

            resolve(next);
        })
            .then(async next => {
                next.totalCount = (await connRead.getOne(`
                    SELECT COUNT(S.D001_SubareasID) AS total
                    FROM D001_Areas A
                    INNER JOIN D001_Subareas S ON (A.D001_AreasID = S.D001_AreasID AND S.Deleted_at IS NULL AND S.Status = 1)
                    WHERE A.Deleted_at IS NULL
                    AND A.Status = 1
                    AND A.Origem = ?;
                `, [
                    next.origem,
                ])).total;

                return next;
            })
            .then(async next => {
                next.filteredCount = (await connRead.getOne(`
                    SELECT COUNT(S.D001_SubareasID) AS total
                    FROM D001_Areas A
                    INNER JOIN D001_Subareas S ON (A.D001_AreasID = S.D001_AreasID AND S.Deleted_at IS NULL AND S.Status = 1)
                    WHERE A.Deleted_at IS NULL
                    AND A.Status = 1
                    AND A.Origem = ?
                    ${next.querySearch}
                    ;
                `, [
                    next.origem,
                ])).total;

                return next;
            })
            .then(async next => {
                next.areas = await connRead.getAll(`
                    SELECT
                        S.D001_SubareasID
                        , A.Origem
                        , IF(A.Origem = 2, 'GTF', 'Financeiro') AS OrigemNome
                        , A.Descricao as Area
                        , S.Descricao as Subarea
                        , S.Created_at
                    FROM D001_Areas A
                    INNER JOIN D001_Subareas S ON (A.D001_AreasID = S.D001_AreasID AND S.Deleted_at IS NULL AND S.Status = 1)
                    WHERE A.Deleted_at IS NULL
                    AND A.Status = 1
                    AND A.Origem = ?
                    ${next.querySearch}
                    ${next.queryOptions.orderBy ? next.queryOptions.orderBy : 'ORDER BY S.Descricao'}
                    ${next.queryOptions.limit ? next.queryOptions.limit : ''}
                    ;
                `, [
                    next.origem,
                ]);

                return next;
            })
            .then(async next => {
                const ret = new JsonReturn();

                ret.addContent('totalCount', next.totalCount);
                ret.addContent('filteredCount', next.filteredCount);
                ret.addContent('areas', next.areas);

                return ret.generate();
            });

    }

    static findOne({ D001_SubareasID }) {

        return new Promise(async (resolve, reject) => {
            const ret = new JsonReturn();

            const subarea = await connRead.getOne(`
                SELECT
                    S.D001_SubareasID
                    , A.Origem
                    , IF(A.Origem = 2, 'GTF', 'Financeiro') AS OrigemNome
                    , A.Descricao as Area
                    , S.Descricao as Subarea
                    , S.Created_at
                FROM D001_Areas A
                INNER JOIN D001_Subareas S ON (A.D001_AreasID = S.D001_AreasID AND S.Deleted_at IS NULL AND S.Status = 1)
                WHERE A.Deleted_at IS NULL
                AND A.Status = 1
                AND S.D001_SubareasID = ?;
            `, [
                D001_SubareasID,
            ]);

            if (!subarea) {
                ret.setError(true);
                ret.setCode(404);
                ret.addMessage('Subárea não encontrada.');
                return reject(ret);
            }

            ret.addContent('subarea', subarea);

            resolve(ret.generate());
        });

    }

    static create(fields) {

        return new Promise((resolve, reject) => {
            const ret = new JsonReturn();

            ret.addFields(['D001_AreasID', 'Descricao']);

            const { D001_AreasID, Descricao } = fields;

            if (!validator(ret, {
                D001_AreasID,
                Descricao,
            }, {
                D001_AreasID: 'required|integer|min:1',
                Descricao: 'required|string|min:3',
            })) {
                ret.setError(true);
                ret.setCode(400);
                ret.addMessage('Verifique todos os campos.');
                return reject(ret);
            }

            const next = {
                D001_AreasID,
                Descricao,
                ret,
            };

            resolve(next);
        })
            .then(async next => {
                next.area = await connRead.getOne(`
                    SELECT D001_AreasID
                    FROM D001_Areas
                    WHERE Deleted_at IS NULL
                    AND Status = 1
                    AND D001_AreasID = ?;
                `, [
                    next.D001_AreasID,
                ]);

                if (!next.area) {
                    next.ret.setFieldError('D001_AreasID', true, 'Área não existe');

                    next.ret.setError(true);
                    next.ret.setCode(400);
                    next.ret.addMessage('Verifique todos os campos.');

                    throw next.ret;
                }

                return next;
            })
            .then(async next => {
                const subareaExists = await connRead.getOne(`
                    SELECT
                        A.D001_AreasID
                        , S.D001_SubareasID
                        , A.Origem
                        , IF(A.Origem = 2, 'GTF', 'Financeiro') AS OrigemNome
                        , A.Descricao as Area
                        , S.Descricao as Subarea
                        , S.Created_at
                    FROM D001_Areas A
                    INNER JOIN D001_Subareas S ON (A.D001_AreasID = S.D001_AreasID AND S.Deleted_at IS NULL AND S.Status = 1)
                    WHERE A.Deleted_at IS NULL
                    AND A.Status = 1
                    AND S.Descricao = ?;
                `, [
                    next.Descricao,
                ]);

                if (subareaExists) {
                    next.ret.setFieldError('Descricao', true, 'Já existe uma subárea com esta descrição.');

                    next.ret.setError(true);
                    next.ret.setCode(400);
                    next.ret.addMessage('Verifique todos os campos.');

                    throw next.ret;
                }

                return next;
            })
            .then(async next => {
                const D001_SubareasID = await connWrite.insert(`
                    INSERT INTO D001_Subareas (D001_AreasID, Descricao, Status)
                    VALUES (?, ?, 1);
                `, [
                    next.D001_AreasID,
                    next.Descricao,
                ]);

                return this.findOne({ D001_SubareasID });
            });

    }

    static update(D001_SubareasID, fields) {

        return this.findOne({ D001_SubareasID })
            .then(async findRet => {
                const subarea = findRet.content.subarea;

                const ret = new JsonReturn();

                ret.addFields(['Descricao']);

                const { Descricao } = fields;

                if (!validator(ret, {
                    Descricao,
                }, {
                    Descricao: 'string|min:3',
                })) {
                    ret.setError(true);
                    ret.setCode(400);
                    ret.addMessage('Verifique todos os campos.');
                    throw ret;
                }

                const next = {
                    Descricao,
                    subarea,
                    ret,
                };

                return next;
            })
            .then(async next => {
                if (next.Descricao) {
                    const subareaExists = await connRead.getOne(`
                        SELECT S.D001_SubareasID
                        FROM D001_Areas A
                        INNER JOIN D001_Subareas S ON (A.D001_AreasID = S.D001_AreasID AND S.Deleted_at IS NULL AND S.Status = 1)
                        WHERE A.Deleted_at IS NULL
                        AND A.Status = 1
                        AND S.Descricao = ?
                        AND S.D001_SubareasID != ?;
                    `, [
                        next.Descricao,
                        D001_SubareasID,
                    ]);

                    if (subareaExists) {
                        next.ret.setFieldError('Descricao', true, 'Já existe uma subárea com esta descrição.');

                        next.ret.setError(true);
                        next.ret.setCode(400);
                        next.ret.addMessage('Verifique todos os campos.');

                        throw next.ret;
                    }
                }

                return next;
            })
            .then(next => {
                if (next.Descricao) next.subarea.Subarea = next.Descricao;

                return next;
            })
            .then(async next => {
                await connWrite.update(`
                    UPDATE D001_Subareas
                    SET Descricao = ?
                    WHERE D001_SubareasID = ?;
                `, [
                    next.subarea.Subarea,
                    D001_SubareasID,
                ]);

                return this.findOne({
                    D001_SubareasID,
                });
            });

    }

    static remove(D001_SubareasID) {

        return this.findOne({ D001_SubareasID })
            .then(() => {
                return connWrite.update(`
                    UPDATE D001_Subareas
                    SET Status = 0, Deleted_at = NOW()
                    WHERE D001_SubareasID = ?;
                `, [
                    D001_SubareasID,
                ]);
            });

    }

    static findUsers(D001_SubareasID, { filter }) {
        return new Promise(resolve => {
            const queryOptions = connRead.generateOptions(filter);

            const querySearch = queryOptions.searchValue.length ? ` AND (${[
                `SU.D001_Subareas_T001_UsuariosID LIKE '%${queryOptions.searchValue}%'`,
                `SU.UsuarioID LIKE '%${queryOptions.searchValue}%'`,
                `U.Nome LIKE '%${queryOptions.searchValue}%'`,
                `SU.ResponsavelOcorrencias LIKE '%${queryOptions.searchValue}%'`,
                `SU.Created_at LIKE '%${queryOptions.searchValue}%'`,
                `DATE_FORMAT(SU.Created_at, '%d/%m/%Y %H:%i:%s') LIKE '%${queryOptions.searchValue}%'`,
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
                SELECT COUNT(SU.D001_Subareas_T001_UsuariosID) AS total
                FROM D001_Subareas_T001_Usuarios SU
                INNER JOIN T001_Usuarios U ON (SU.UsuarioID = U.UsuarioID)
                WHERE SU.Deleted_at IS NULL
                AND SU.D001_SubareasID = ?;
                `, [
                    D001_SubareasID,
                ])).total;

                return next;
            })
            .then(async next => {
                next.filteredCount = (await connRead.getOne(`
                    SELECT COUNT(SU.D001_Subareas_T001_UsuariosID) AS total
                    FROM D001_Subareas_T001_Usuarios SU
                    INNER JOIN T001_Usuarios U ON (SU.UsuarioID = U.UsuarioID)
                    WHERE SU.Deleted_at IS NULL
                    AND SU.D001_SubareasID = ?
                    ${next.querySearch}
                    ;
                `, [
                    D001_SubareasID,
                ])).total;

                return next;
            })
            .then(async next => {
                next.users = await connRead.getAll(`
                    SELECT
                        SU.D001_Subareas_T001_UsuariosID
                        , SU.UsuarioID
                        , U.Nome
                        , SU.ResponsavelOcorrencias
                        , SU.Created_at
                    FROM D001_Subareas_T001_Usuarios SU
                    INNER JOIN T001_Usuarios U ON (SU.UsuarioID = U.UsuarioID)
                    WHERE SU.Deleted_at IS NULL
                    AND SU.D001_SubareasID = ?
                    ${next.querySearch}
                    ${next.queryOptions.orderBy ? next.queryOptions.orderBy : 'ORDER BY UsuarioID'}
                    ${next.queryOptions.limit ? next.queryOptions.limit : ''}
                    ;
                `, [
                    D001_SubareasID,
                ]);

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

}

module.exports = SubareasRepository;
