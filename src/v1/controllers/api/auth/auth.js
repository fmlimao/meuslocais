const errorHandler = require('../../../helpers/error-handler');
const AuthRepository = require('../../../repositories/auth');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const user = await AuthRepository.findUserByEmailAndPassword(req.body);

        ret.addContent('token', user.content.token);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
