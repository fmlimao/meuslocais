module.exports = async (req, res) => {
    res.clearCookie('auth');
    res.clearCookie('configs');
    return res.redirect('/admin/v1/login');
};
