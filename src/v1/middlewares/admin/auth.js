const md5 = require('md5');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const checkAjaxResponse = require('../../helpers/check-ajax-response');

module.exports = async (req, res, next) => {
    try {
        const { auth, configs } = req.cookies;
        if (!auth || !configs) throw new Error('Usuário não autenticado.');

        console.log('configs', configs);

        auth.nome = 'Leandro Macedo';
        auth.email = 'fmlimao@gmail.com';

        const md5Email = md5(auth.email);
        const avatarUrl = `https://www.gravatar.com/avatar/${md5Email}`;

        auth.avatarUrl = avatarUrl;

        req.auth = auth;
        res.locals.auth = auth;

        req.configs = configs;
        res.locals.configs = configs;

        next();
    } catch (err) {
        return res.redirect('/admin/v1/logout');
    }

};
