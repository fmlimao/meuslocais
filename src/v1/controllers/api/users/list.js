const errorHandler = require('../../../helpers/error-handler');
const UsersRepository = require('../../../repositories/users');

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
        const users = await UsersRepository.findAll({
            filter: req.query,
        });

        users.content.users = users.content.users.map(user => {
            delete user.password;
            delete user.salt;
            return user;
        });

        if (draw) {
            retDatatable.data = users.content.users;

            retDatatable.recordsTotal = users.content.totalCount;
            retDatatable.recordsFiltered = users.content.filteredCount;

            res.status(200).json(retDatatable);
        } else {
            const meta = {
                recordsTotal: users.content.totalCount,
                recordsFiltered: users.content.filteredCount,
            };

            ret.addContent('meta', meta);
            ret.addContent('users', users.content.users);

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
