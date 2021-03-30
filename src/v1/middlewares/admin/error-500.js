module.exports = (err, req, res, next) => {
    console.log(`[ADMIN ERRO INTERNO]: ${err}`);
    res.status(500).render('admin/error-500', {
        page: req.path,
    });
};
