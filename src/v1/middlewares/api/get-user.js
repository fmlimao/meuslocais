const errorHandler = require('../../helpers/error-handler');
const UsersRepository = require('../../repositories/users');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { user_id } = req.params;

        const user = await UsersRepository.findOne({
            user_id,
        });

        if (!user.content.user) {
            ret.setError(true);
            ret.setCode(404);
            ret.addMessage('Usuário não encontrado.');
            throw ret;
        }

        delete user.content.user.password;
        delete user.content.user.salt;

        req.user = user.content.user;

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
