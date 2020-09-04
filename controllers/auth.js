const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // nodejs内置模块，可以生成随机伪密的字符串
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    // 邮件服务器的授权内容
    auth: {
        user: 'lantzshaw@163.com',
        pass: 'LDETBWFBIHDNZHLO'
    }
});

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie'));
    // 字符串信息
    // let isLogined = false;
    // if(req.get('Cookie')) {
    //     isLogined = req.get('Cookie').split('=')[1] === 'true'
    // }
    // console.log(isLogined);
    // session以及cookie无法进行夸浏览器访问
    res.render('auth/login', {
        docTitle: '用户登录',
        breadcrumb: [
            { name: '首页', url: '/', hasBreadcrumbUrl: true },
            { name: '用户登录', hasBreadcrumbUrl: false }
        ],
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '' },
        validationErrors: []
        // isAuthenticated: false,
        // csrfToken: req.csrfToken()
    });
};

exports.postLogin = (req, res, next) => {
    // req.isLogined = true;
    // res.setHeader('set-Cookie', 'isLogined=true; secure; httpOnly');
    // res.cookie('isLogined', true, {httpOnly: true});

    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req); // 在所有请求查找
    if (!errors.isEmpty()) {
        // console.log(errors.array());
        // 422页面重新渲染
        return res.status('422').render('auth/login', {
            docTitle: '用户登录',
            breadcrumb: [
                { name: '首页', url: '/', hasBreadcrumbUrl: true },
                { name: '用户登录', hasBreadcrumbUrl: false }
            ],
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                // req.flash('error', '没有匹配的用户信息');
                // return res.redirect('./login');
                return res.status('422').render('auth/login', {
                    docTitle: '用户登录',
                    breadcrumb: [
                        { name: '首页', url: '/', hasBreadcrumbUrl: true },
                        { name: '用户登录', hasBreadcrumbUrl: false }
                    ],
                    errorMessage: '没有匹配的用户信息',
                    oldInput: { email, password },
                    validationErrors: []
                });
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLogined = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            return res.redirect('/');
                        });
                    }
                    // req.flash('error', '用户登录密码有误');
                    // res.redirect('/login');
                    return res.status('422').render('auth/login', {
                        docTitle: '用户登录',
                        breadcrumb: [
                            { name: '首页', url: '/', hasBreadcrumbUrl: true },
                            { name: '用户登录', hasBreadcrumbUrl: false }
                        ],
                        errorMessage: '用户登录密码有误',
                        oldInput: { email, password },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        docTitle: '用户注册',
        breadcrumb: [
            { name: '首页', url: '/', hasBreadcrumbUrl: true },
            { name: '用户注册', hasBreadcrumbUrl: false }
        ],
        errorMessage: req.flash('error'),
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: []
        // isAuthenticated: false
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req); // 在所有请求查找
    if (!errors.isEmpty()) {
        // console.log(errors.array());
        // 422页面重新渲染
        return res.status('422').render('auth/signup', {
            docTitle: '用户注册',
            breadcrumb: [
                { name: '首页', url: '/', hasBreadcrumbUrl: true },
                { name: '用户注册', hasBreadcrumbUrl: false }
            ],
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password, confirmPassword },
            validationErrors: errors.array()
        });
    }

    // User.findOne({ email })
    //     .then(userDoc => {
    //         if (userDoc) {
    //             req.flash('error', '该用户已经存在');
    //             res.redirect('/signup');
    //         }
    //         if (password !== confirmPassword) {
    //             req.flash('error', '两次密码不一致');
    //             res.redirect('/signup');
    //         }

    //         // bcrypt返回也是一个promise
    //         return
    bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
            email,
            password: hashedPassword,
            cart: {
                items: []
            }
        });
        return user
            .save()
            .then(result => {
                res.redirect('/login');
                transporter.sendMail({
                    from: 'lantzshaw@163.com',
                    to: email,
                    subject: '注册成功',
                    html: '<b>欢迎用户注册<b>'
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        docTitle: '修改密码',
        breadcrumb: [
            { name: '首页', url: '/', hasBreadcrumbUrl: true },
            { name: '修改密码', hasBreadcrumbUrl: false }
        ],
        errorMessage: req.flash('error')
    });
};

exports.postReset = (req, res, next) => {
    const email = req.body.email;

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({ email })
            .then(user => {
                if (!user) {
                    req.flash('error', '该邮箱用户不存在');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;

                return user
                    .save()
                    .then(result => {
                        res.redirect('/');

                        transporter.sendMail({
                            from: 'lantzshaw@163.com',
                            to: email,
                            subject: '修改密码',
                            html: `
                            你请求了重置密码的操作，可以点击链接地址：
                            <a href="http://localhost:3000/reset/${token}">修改密码</a>
                        `
                        });
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                res.redirect('/login');
            }

            res.render('auth/new-password', {
                docTitle: '设置新密码',
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    { name: '设置新密码', hasBreadcrumbUrl: false }
                ],
                userId: user._id.toString(),
                passwordToken: token,
                errorMessage: req.flash('error')
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.newPassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;

            return resetUser
                .save()
                .then(result => {
                    res.redirect('/login');
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
