const errorHandler = require('../../helpers/error-handler');
const AreasRepository = require('../../repositories/areas');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { D001_AreasID } = req.params;

        const area = await AreasRepository.findOne({
            D001_AreasID,
        });

        req.area = area.content.area;

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
