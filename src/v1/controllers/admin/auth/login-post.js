const base64 = require('base-64');
const querystring = require('querystring');

module.exports = async (req, res) => {

    let ret = req.ret;

    try {
        ret.addFields(['token']);

        let { token } = req.body;

        const decodedToken = base64.decode(token);
        const decodedQueryString = querystring.parse(decodedToken.replace('?', ''));
        ret.addContent('decodedToken', decodedToken);
        ret.addContent('decodedQueryString', decodedQueryString);

        const configs = {
            origem: 2,
        };

        res.cookie('auth', decodedQueryString);
        res.cookie('configs', configs);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        console.log('catch response', err.message);
        // console.log('catch response', err.response.data);
        ret.setError(true);
        ret.setCode(400);
        ret.addMessage(err.message);
        res.status(ret.getCode()).json(ret.generate());
    }
};
