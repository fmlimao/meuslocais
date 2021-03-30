module.exports = (req, res) => {
    const ret = req.ret;
    ret.addContent('status', 'ok');
    res.status(ret.getCode()).json(ret.generate());
};
