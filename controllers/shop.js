const Product = require('../models/product');
const Order = require('../models/order');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const AlipaySdk = require('alipay-sdk').default;
const AliPayFormData = require('alipay-sdk/lib/form').default;

const alipaySdk = new AlipaySdk({
    appId: '2016102700770436',
    gateway: 'https://openapi.alipaydev.com/gateway.do',
    privateKey:
        'MIIEpQIBAAKCAQEAq6qPatJIZEhKHeijqcQCtPgyId5qpC5GRICjxiOpEmXnKXKmhqYXPtmrU6wIGsSVG7yvLXbQEXCPPy3EM+J8vvSEbvfYRnjGxgo9plc+uKnHWdWjHOodbewcopDN+uFni2Nds+GwC+V3IvbBhFWs1uXp5T5IjPvPTyIiKF0XT7ZXklfQSesfQqs+6aKmsaJNgmiVIu64yIYdPoxGsny8CkMBXiZR+wzEZqZnPhG6pK+FMSOcYYrkd8T7zqK881bftePIG5sJgnnpMQ6glr1svv7eXRG9haRaFxM2qeV4Eu/VoqSUfiLmHxxRQk/9ZTESqdHaVvGN4Frafq4zjgMUOQIDAQABAoIBADOziMIpVvgs9XWQjUoh6JbMcXzV2dRcw3j6LVkNgGw0GKzZBOJkv3eEYx8uHrrBHg9egnv03rGB7wKeLAtcWSnBxukM6CxBT8xxZSPl/tPq/klGGHwq3nYuuGkVp5O5s0+9u4jjnfvXPkxfeOT8ULPgRtNuMLeVV1iD9Tmm39B3oNOcA9GZReW6vKAm9WEJ/5F7VZ270hefbayMGshAKLqZ5sP/KsNbhjYUots5qpIQHXbk8qcE7ZjQpmZ3B4MLzr0DTsVdcI5iI00LnDUPwoumQ95fu3kHKfgGOP3nsYNku8OCJkGRkZ1nalPL/sADQIRPkGVRH1FAjQWl12UKaqECgYEA8dNp0IHStz530SAxn20+gWjSQs/XdzgeoqVNWO8xstF8lfpK+jMUQBxY0NRRuOP7HL6X74tMb5GiSA7M2CiAC+cNNUhgA5u/64q+C1YCF6Er/omjhZTHr3uvx38gcsSUOaNFvJrkPn+/ae/AvmT2pW22KSl6IkMm02R0UKHzK+UCgYEAtbpnvfoyZ4/7eNoFv1YJd4r7/cx/GG5GDTXzeoH25ofHka21VMqPnytEoExGjy4cJb47jY3MrTe2ixZThUFKB2RAOqxEJ6a5WK7c8/nxRDYeatQ9ZtsrBIZf61A3wpMlo7l2vKePPAL1Wvju7lP2QABeJAcU8dJhraIqXGMGScUCgYEAzuabOhJZPv7rdLmeu1C0kfQlMZSyPQZ+75mOu/CrDNu/RHKJg9gAE3otYz7FTPOB/e30ALemBi8MMaq4CJleNNDStCvgOjYf1l82imxkDeOPyI/qoHfTAYlJs95I3OjkCQxwthWwAuk51GGU/1FS1ecwW7dpD7d0mJjyC6sEayECgYEAg6QeVl4ReTexoJ++nhXDEdeaJwWl45quIA++6jWPFvuws3Sz8FIzq8d6FOxsCHgMZ8Lf/PCFHc1H7IUlx1e+OpCCfn4feOGrTfSNliaugQz7B8PrHsEQ7lwwy5L2cXqKP4mv24U9mulBtr6wxfAIZ+BcUZjXsT0HCPJ54SbSfUkCgYEAnlH4EDac8Hn12RuHZNTPF7XtuG3AHUcsTmAx8TyJ/cIwmsgRuniCxKXL5e7Aazug3QZncLe1+Ib16UmNr656XyaTmEP+GyB78PeR29XTu0BLfrYu9HhMTxYJpJdMtjoR4nYpm/3SOUsOJGLfn9RR49ArvKTSKmsIrUqfKCS7K60=',
    alipayPublicKey:
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv/Tg1KJdxBQKNpXTIkd6yabdn69TZtanvshOiSSFFENV4f7MwZrw/t5F88thx/87aWjtYe10RJTnRPPIT0QbEyr4Cq15Ljb3PUXiuju57glv6KFeahmjNesjIDRk9KzbP02rUBPTesH7L5q+dnf8tyJ+bB0gmXG3xDb6MsYgjQ++l7xmgjv59BfjS/rWAI+ys+96e2kRnhGk2HNEzGZUG+HOtGytU5PxpVgj3Itvpc7rsg465yiMu5rgKfPhmY72j8ZAyRxLnhZ79I0nz8cJwkz73JnHksrVyrtKD7p7OZ9kiXYlZQ7tq3K4he+wTT3NH6/jqZvyJ84+THbIYG9obwIDAQAB'
});

const ITEMS_PER_PAGE = 3;
let totalItems = 0;
let totalPages = 0;

exports.getProduct = (req, res, next) => {
    // 为什么要加"+"号
    const page = +req.query.page || 1;
    // Product.fetchAll().then(products => {
    //     res.render('shop/product-list', {
    //         pros: products,
    //         docTitle: '产品中心',
    //         activeProductList: true,
    //         breadcrumb: [
    //             { name: '首页', url: '/', hasBreadcrumbUrl: true },
    //             { name: '产品中心', hasBreadcrumbUrl: false }
    //         ]
    //     });
    // });

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE); // 向上取整
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                pros: products,
                docTitle: '产品中心',
                activeProductList: true,
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    { name: '产品中心', hasBreadcrumbUrl: false }
                ],
                isAuthenticated: req.session.isLogined,
                totalItems,
                totalPages,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                currentPage: page,
                firstPage: 1
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getIndex = (req, res, next) => {
    // Product.fetchAll().then(products => {
    //     res.render('shop/index', {
    //         pros: products,
    //         docTitle: '商城',
    //         activeShop: true,
    //         breadcrumb: [
    //             { name: '首页', url: '/', hasBreadcrumbUrl: true },
    //             { name: '商城', hasBreadcrumbUrl: false }
    //         ]
    //     });
    // });
    const page = +req.query.page || 1;

    const customLabels = {
        totalDoc: 'totalItems',
        page: 'currentPage',
        docs: 'pros'
    };

    Product.paginate({}, { page, limit: ITEMS_PER_PAGE, customLabels })
        .then(products => {
            res.render('shop/index', {
                ...products,
                docTitle: '商城',
                activeShop: true,
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    { name: '商城', hasBreadcrumbUrl: false }
                ]
                // isAuthenticated: req.session.isLogined,
                // csrfToken: req.csrfToken()
            });
            // console.log(result);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            // console.log(products);

            res.render('shop/cart', {
                docTitle: '购物车',
                activeCart: true,
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    { name: '购物车', hasBreadcrumbUrl: false }
                ],
                cartProducts: products
                // isAuthenticated: req.session.isLogined
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// exports.getCart = (req, res, next) => {
//     req.user
//         // 这里不太懂
//         .populate('cart.items.productId')
//         .execPopulate()
//         .then(user => {
//             const products = user.cart.items;
//             // const cartProducts = [];
//             // for (product of products) {
//             //     const cartProductData = cart.products.find(prod => prod.id === product.id);
//             //     // console.log(cartProductData);
//             //     if (cartProductData) {
//             //         cartProducts.push({ ...product, qty: cartProductData.qty });
//             //     }
//             // }
//             console.log(products);

//             res.render('shop/cart', {
//                 docTitle: '购物车',
//                 activeCart: true,
//                 breadcrumb: [
//                     { name: '首页', url: '/', hasBreadcrumbUrl: true },
//                     { name: '购物车', hasBreadcrumbUrl: false }
//                 ],
//                 cartProducts: products,
//                 isAuthenticated: req.session.isLogined
//             });
//         });
// };

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    // Product.findById(productId, product => {
    //     Cart.deleteProduct(productId, product.price);
    // });

    // res.redirect('/cart');

    req.user
        .deleteProductFromCart(productId)

        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProductDetail = (req, res, next) => {
    const productId = req.params.productId;
    // Product.findOne({where: {id: productId}})    返回的是单个的产品信息，相当于findByPk与findAll两种方式的组合
    // Prodduct.findByPk(productId) 返回也是单个产品
    // Product.findAll({where: {id: productId}})  返回是一个数组
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                docTitle: '产品详情',
                product: product,
                activeProductList: true,
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    {
                        name: '产品中心',
                        url: '/shop/product-list',
                        hasBreadcrumbUrl: true
                    },
                    { name: '产品详情', hasBreadcrumbUrl: false }
                ]
                // isAuthenticated: req.session.isLogined
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAddToCart = (req, res, next) => {
    const productId = req.body.productId;

    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCreateOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId') // 找到user数据模型中的cart.items.productId //进行数据关联
        .execPopulate() // 上面关联操作的执行、为什么有的时候不用加exePopulate
        .then(user => {
            const products = user.cart.items.map(item => {
                // console.log(item.productId); // 这里打印的是整个的产品对象
                return { quantity: item.quantity, product: { ...item.productId._doc } }; // _doc可以不用加
            });

            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user._id
                },
                products
            });
            // 这个地方要设置异常捕获吗？？？
            return order.save().catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
            // console.log(products);
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(result => {
            res.redirect('/checkout');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    // let fetchedCart;
    // req.user
    //     .createOrder()
    //     .then(result => {
    //         res.redirect('/checkout');
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });
};

exports.getCheckout = (req, res, next) => {
    // include里面的参数为表名
    Order.find({ 'user.userId': req.user._id }).then(orders => {
        // console.log(orders);
        res.render('shop/checkout', {
            docTitle: '订单管理',
            activeCheckout: true,
            orders,
            breadcrumb: [
                { name: '首页', url: '/', hasBreadcrumbUrl: true },
                { name: '订单管理', hasBreadcrumbUrl: false }
            ]
            // isAuthenticated: req.session.isLogined
        });
    });
};

exports.getInvoices = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice' + '-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);
    const fontsPath = path.join('fonts', 'msyh.ttf');

    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('没有匹配订单信息'));
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('未授权操作'));
            }
            // 如果文件很大，就不能用这种方式
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         next(err);
            //     }
            //     // console.log('程序中断'); 这里有问题
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', `inline; filename=invoice-${orderId}.pdf`);
            //     return res.send(data);
            // });

            // const file = fs.createReadStream(invoicePath);
            // file.on('data', chunk => {
            //     console.log(chunk.length);
            // });

            // file.pipe(res);

            const pdfDoc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=invoice-${orderId}.pdf`);
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc
                .font(fontsPath)
                .fontSize(25)
                .text('发货单');
            pdfDoc.text('-----------------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.product.price * prod.quantity;
                pdfDoc
                    .font(fontsPath)
                    .fontSize(14)
                    .text('产品名称：' + prod.product.title + '\n' + '购买数量：' + prod.quantity + '\n' + '产品价格：' + prod.product.price);
            });
            pdfDoc.text('-----------------------------------');
            pdfDoc
                .font(fontsPath)
                .fontSize(25)
                .text('-------------');
            pdfDoc.font(fontsPath).text('订单总价：￥' + totalPrice);
            pdfDoc.end();
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrderPay = (req, res, next) => {
    const outTradeNo = req.body.outTradeNo;
    const productCode = req.body.productCode;
    const totalAmount = req.body.totalAmount;
    const productSubject = req.body.productSubject;

    const formData = new AliPayFormData();
    console.log(outTradeNo, productCode, productSubject, totalAmount);
    formData.setMethod('get');
    formData.addField('return_url', 'http://localhost:3000/alipay/returnUrl');
    formData.addField('bizContent', {
        outTradeNo,
        productCode,
        totalAmount,
        subject: productSubject
    });

    alipaySdk
        .exec('alipay.trade.page.pay', {}, { formData })
        .then(result => {
            res.redirect(result);
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getReturnUrl = (req, res, next) => {
    console.log(req.query);
};

exports.getPayment = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            let totalSum = 0;
            order.products.forEach(prod => {
                totalSum = prod.product.price * prod.quantity;
            });

            res.render('shop/payment', {
                docTitle: '支付确认',
                activeCheckout: true,
                order,
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    { name: '支付确认', hasBreadcrumbUrl: false }
                ],
                totalSum
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
