const errorHandler = require('../../helpers/error-handler');
const SubareasRepository = require('../../repositories/subareas');

module.exports = async (req, res, next) => {
    let ret = req.ret;

    try {
        const { D001_SubareasID } = req.params;

        const area = await SubareasRepository.findOne({
            D001_SubareasID,
        });

        req.subarea = area.content.subarea;

        next();
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
