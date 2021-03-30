const jwt = require('jsonwebtoken');
const errorHandler = require('../../helpers/error-handler');
const UsersRepository = require('../../repositories/users');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const token = req.header('x-access-token');

        if (!token) {
            ret.setCode(401);
            throw new Error('Token inválido.');
        }

        const key = process.env.TOKEN_SECRET;
        const decodedToken = jwt.verify(token, key);

        const userExists = await UsersRepository.findOne({
            user_id:  decodedToken.id,
        });

        const user = userExists.content.user;

        if (!user) {
            ret.setCode(401);
            throw new Error('Token inválido.');
        }

        delete user.password;
        delete user.salt;

        req.auth = {
            user,
        };

        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            err.message = 'Token inválido.';
            ret.setCode(401);
            ret = errorHandler(err, ret);
            return res.status(ret.getCode()).json(ret.generate());
        } else if (err.name === 'TokenExpiredError') {
            ret.setCode(401);
            ret.addMessage('Token expirado.');
            return res.status(ret.getCode()).json(ret.generate());
        }

        ret = errorHandler(err, ret);
        return res.status(ret.getCode()).json(ret.generate());
    }
};
