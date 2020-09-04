module.exports = (req, res, next) => {
    if (!req.session.isLogined) {
        return res.redirect('/login');
    }
    next();
};
