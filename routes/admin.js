const express = require('express');
const path = require('path');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth.js');
const { body } = require('express-validator');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
    '/add-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim()
            .withMessage('标题内容至少为3个字符'),
        // body('imageUrl')
        //     .isURL()
        //     .withMessage('请输入有效的URL地址'),
        body('price')
            .isFloat()
            .withMessage('请输入正确的价格'),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
            .withMessage('描述信息在5-400个字符之间')
    ],
    isAuth,
    adminController.postAddProduct
);

router.post(
    '/edit-product',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim()
            .withMessage('标题内容至少为3个字符'),
        // body('imageUrl')
        //     .isURL()
        //     .withMessage('请输入有效的URL地址'),
        body('price')
            .isFloat()
            .withMessage('请输入正确的价格'),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
            .withMessage('描述信息在5-400个字符之间')
    ],
    isAuth,
    adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

router.get('/products', isAuth, adminController.getProducts);

module.exports = router;
