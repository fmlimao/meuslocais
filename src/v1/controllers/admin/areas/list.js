module.exports = (req, res) => {
    res.render('admin/areas/list', {
        page: req.path,
    });
};
