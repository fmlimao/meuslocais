const errorHandler = require('../../../helpers/error-handler');
const UsersRepository = require('../../../repositories/users');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { user_id } = req.params;

        await UsersRepository.remove(user_id);

        ret.setCode(204);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
