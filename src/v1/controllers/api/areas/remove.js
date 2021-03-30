const errorHandler = require('../../../helpers/error-handler');
const AreasRepository = require('../../../repositories/areas');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { D001_AreasID } = req.params;

        await AreasRepository.remove(D001_AreasID);

        ret.setCode(204);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
