const JsonReturn = require('./json-return');

module.exports = function (err, ret) {
    if (err instanceof JsonReturn) {
        return err;
    }

    console.log(`[API ERRO INTERNO]: ${err}`);
    if (ret.getCode() === 200) {
        ret = new JsonReturn();

        ret.setError(true);
        ret.setCode(500);
        ret.addMessage('Erro interno. Por favor, tente novamente.');

        if (process.env.APP_DEBUG == 1) {
            ret.addMessage(err.message);
        }
    } else {
        ret.setError(true);
        if (err.message) {
            ret.addMessage(err.message);
        }
    }

    return ret;
};