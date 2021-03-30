module.exports = (req, res) => {
    res.render('admin/subareas/list', {
        page: req.path,
    });
};
