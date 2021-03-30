module.exports = (req, res) => {
    res.render('admin/index', {
        page: req.path,
    });
};
