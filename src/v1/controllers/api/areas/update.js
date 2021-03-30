const errorHandler = require('../../../helpers/error-handler');
const AreasRepository = require('../../../repositories/areas');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { D001_AreasID } = req.params;

        const updated = await AreasRepository.update(D001_AreasID, req.body);

        ret.addMessage('Área editada com sucesso.');
        ret.addContent('area', updated.content.area);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
