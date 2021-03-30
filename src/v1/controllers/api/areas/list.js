const errorHandler = require('../../../helpers/error-handler');
const AreasRepository = require('../../../repositories/areas');

module.exports = async (req, res) => {
    const draw = req.query.draw || null;

    let ret = req.ret;

    let retDatatable = {
        draw: req.query.draw,
        recordsTotal: 0,
        recordsFiltered: 0,
        data: [],
    };

    try {
        const areas = await AreasRepository.findAll({
            filter: req.query,
        });

        if (draw) {
            retDatatable.data = areas.content.areas;

            retDatatable.recordsTotal = areas.content.totalCount;
            retDatatable.recordsFiltered = areas.content.filteredCount;

            res.status(200).json(retDatatable);
        } else {
            const meta = {
                recordsTotal: areas.content.totalCount,
                recordsFiltered: areas.content.filteredCount,
            };

            ret.addContent('meta', meta);
            ret.addContent('areas', areas.content.areas);

            res.status(ret.getCode()).json(ret.generate());
        }
    } catch (err) {
        if (draw) {
            console.log(`[API ERRO INTERNO]: ${err}`);
            res.status(500).json(retDatatable);
        } else {
            ret = errorHandler(err, ret);
            res.status(ret.getCode()).json(ret.generate());
        }
    }
};
