const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JsonReturn = require('../helpers/json-return');
const errorHandler = require('../helpers/error-handler');
const validator = require('../helpers/validator');
const UsersRepository = require('./users');

class AuthRepository {

    static findUserByEmailAndPassword({ email, password }) {

        return new Promise(async (resolve, reject) => {
            let ret = new JsonReturn();

            try {
                ret.addFields(['email', 'password']);

                const dataValidate = validator(ret, {
                    email,
                    password,
                }, {
                    email: 'required|string|email',
                    password: 'required|string',
                });

                if (ret.error) {
                    throw ret;
                }

                const userRet = await UsersRepository.findOne({ email });

                if (!userRet.content.user) {
                    ret.setError(true);
                    ret.setCode(404);
                    ret.addMessage('Usuário não encontrada.');
                    return reject(ret);
                }

                const user = userRet.content.user;

                // const saltLength = Number(process.env.AUTH_SALT_LENGTH);
                // const salt = bcrypt.genSaltSync(saltLength);
                // const newPassword = bcrypt.hashSync(password, salt);

                const passwordVerify = bcrypt.compareSync(password, user.password);

                if (!passwordVerify) {
                    ret.setCode(404);
                    throw new Error('Usuário não encontrado.');
                }

                const login = {
                    id: user.user_id,
                };

                const exp = Number(process.env.TOKEN_EXPIRATION_SEC);
                if (exp) {
                    login.exp = Math.floor(Date.now() / 1000) + exp;
                }

                const key = process.env.TOKEN_SECRET;
                const token = jwt.sign(login, key);

                ret.addContent('token', token);

                resolve(ret.generate());
            } catch (err) {
                ret = errorHandler(err, ret);
                reject(ret);
            }
        });

    }

}

module.exports = AuthRepository;
