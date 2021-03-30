module.exports = (req, res, next) => {
    res.status(404).render('admin/error-404', {
        page: req.path,
    });
};
