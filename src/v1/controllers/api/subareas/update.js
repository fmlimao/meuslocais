const errorHandler = require('../../../helpers/error-handler');
const SubareasRepository = require('../../../repositories/subareas');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const { D001_SubareasID } = req.params;

        const updated = await SubareasRepository.update(D001_SubareasID, req.body);

        ret.addMessage('Subárea editada com sucesso.');
        ret.addContent('subarea', updated.content.subarea);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
