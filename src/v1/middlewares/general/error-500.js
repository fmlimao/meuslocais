module.exports = (err, req, res, next) => {
    console.log(`[GENERAL ERRO INTERNO]: ${err}`);
    res.status(500).render('general/error-500', {
        layout: false,
    });
};
