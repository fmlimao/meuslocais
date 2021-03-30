const errorHandler = require('../../../helpers/error-handler');
const SubareasRepository = require('../../../repositories/subareas');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const inserted = await SubareasRepository.create(req.body);

        ret.setCode(201);
        ret.addMessage('Subárea inserida com sucesso.');
        ret.addContent('subarea', inserted.content.subarea);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
