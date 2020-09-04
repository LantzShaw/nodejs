const express = require('express');
const path = require('path');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth.js');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/product-list', shopController.getProduct);

router.get('/product-detail/:productId', shopController.getProductDetail);

router.get('/cart', isAuth, shopController.getCart);

router.post('/add-to-cart', isAuth, shopController.postAddToCart);

router.post('/create-order', isAuth, shopController.postCreateOrder);

router.post('/cart-delete-product', isAuth, shopController.postCartDeleteProduct);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/payment/:orderId', isAuth, shopController.getPayment);

router.get('/checkout/:orderId', isAuth, shopController.getInvoices);

router.post('/orderPay', isAuth, shopController.postOrderPay);

router.get('/alipay/returnUrl', isAuth, shopController.getReturnUrl);

module.exports = router;
