const errorHandler = require('../../../helpers/error-handler');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        ret.addContent('subarea', req.subarea);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
