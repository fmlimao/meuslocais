const errorHandler = require('../../../helpers/error-handler');
const { getUsersData } = require('../../../helpers/ms-idm-api');
const connWrite = require('../../../database/conn-write');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const users = await getUsersData([], ['usuarioId', 'nome', 'cpf', 'email']);

        await connWrite.update(`TRUNCATE T001_Usuarios;`);

        const queryInsert = `INSERT INTO T001_Usuarios (UsuarioID, Email, Nome, CPF) VALUES `;
        const queryInsertValuesKeys = [];
        const values = [];

        for (let i in users) {
            queryInsertValuesKeys.push('(?, ?, ?, ?)');
            values.push(users[i].usuarioId);
            values.push(users[i].email);
            values.push(users[i].nome);
            values.push(users[i].cpf);
        }

        const query = `${queryInsert} ${queryInsertValuesKeys.join(', ')}`;

        await connWrite.insert(query, values);

        ret.addMessage('Usuários carregados com sucesso.');

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
