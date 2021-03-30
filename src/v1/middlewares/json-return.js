const JsonReturn = require('../helpers/json-return');

module.exports = (req, res, next) => {
    req.ret = new JsonReturn();
    next();
};
