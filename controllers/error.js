exports.get404 = (req, res, next) => {
    res.status(404).render('404', { docTitle: '页面没有找到', isAuthenicated: req.session.isLogined });
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', { docTitle: '服务器出错', isAuthenicated: req.session.isLogined });
};