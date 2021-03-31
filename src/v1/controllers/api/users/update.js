const errorHandler = require('../../../helpers/error-handler');
const UsersRepository = require('../../../repositories/users');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { user_id } = req.params;
        const { name, email, password } = req.body;

        const updated = await UsersRepository.update(user_id, { name, email, password });
        delete updated.content.user.password;
        delete updated.content.user.salt;

        ret.addMessage('Usuário editado com sucesso.');
        ret.addContent('user', updated.content.user);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
