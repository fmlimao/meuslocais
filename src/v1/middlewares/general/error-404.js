module.exports = (req, res, next) => {
    res.status(404).render('general/error-404', {
        layout: false,
    });
};
