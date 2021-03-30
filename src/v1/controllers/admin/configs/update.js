// const base64 = require('base-64');
// const querystring = require('querystring');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {

        let { origem } = req.body;
        const { auth, configs } = req.cookies;

        if (typeof origem !== 'undefined') {
            configs['origem'] = Number(origem);
            res.cookie('configs', configs);
            ret.addMessage('Origem editada com sucesso.');
        }

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret.setError(true);
        ret.setCode(400);
        ret.addMessage(err.message);
        res.status(ret.getCode()).json(ret.generate());
    }
};
