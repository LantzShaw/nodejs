const express = require('express');
const path = require('path');
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const User = require('../models/user.js');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('请输入正确的邮箱')
            .normalizeEmail(),
        body('password', '密码不能小于5个字符，且只能为字母或数字')
            .isLength({ min: 5 })
            // .withMessage('密码不能小于5个字符')
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('请输入正确的邮箱')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('该用户已经存在');
                    }
                    return true;
                });
                // if (value === 'lantzshaw_1997@163.com') {
                //     throw new Error('此邮箱禁止注册');
                // }
                // return true; // 中止
            })
            .normalizeEmail(),
        body('password', '密码不能小于5个字符，且只能为字母或数字')
            .isLength({ min: 5 })
            // .withMessage('密码不能小于5个字符')
            .isAlphanumeric()
            .trim(),
        // .withMessage('密码为字母或数字')
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('两次密码输入不一致');
            }
            return true;
        })
    ],
    authController.postSignup
);

router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

router.post('/reset', authController.postReset);

module.exports = router;
