const errorHandler = require('../../../helpers/error-handler');
const UsersRepository = require('../../../repositories/users');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const inserted = await UsersRepository.create(req.body);
        delete inserted.content.user.password;
        delete inserted.content.user.salt;

        ret.setCode(201);
        ret.addMessage('Usuário inserido com sucesso.');
        ret.addContent('user', inserted.content.user);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
