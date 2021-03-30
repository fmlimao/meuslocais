const errorHandler = require('../../../helpers/error-handler');
const SubareasRepository = require('../../../repositories/subareas');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { D001_SubareasID } = req.params;

        await SubareasRepository.remove(D001_SubareasID);

        ret.setCode(204);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
