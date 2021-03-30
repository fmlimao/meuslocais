const errorHandler = require('../../../helpers/error-handler');
const AreasRepository = require('../../../repositories/areas');

module.exports = async (req, res) => {
    let ret = req.ret;

    try {
        const inserted = await AreasRepository.create(req.body);

        ret.setCode(201);
        ret.addMessage('Área inserida com sucesso.');
        ret.addContent('area', inserted.content.area);

        res.status(ret.getCode()).json(ret.generate());
    } catch (err) {
        ret = errorHandler(err, ret);
        res.status(ret.getCode()).json(ret.generate());
    }
};
