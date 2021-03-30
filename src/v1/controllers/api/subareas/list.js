const errorHandler = require('../../../helpers/error-handler');
const SubareasRepository = require('../../../repositories/subareas');

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
        const subareas = await SubareasRepository.findAll({
            filter: req.query,
        });

        if (draw) {
            retDatatable.data = subareas.content.areas;

            retDatatable.recordsTotal = subareas.content.totalCount;
            retDatatable.recordsFiltered = subareas.content.filteredCount;

            res.status(200).json(retDatatable);
        } else {
            const meta = {
                recordsTotal: subareas.content.totalCount,
                recordsFiltered: subareas.content.filteredCount,
            };

            ret.addContent('meta', meta);
            ret.addContent('subareas', subareas.content.areas);

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
