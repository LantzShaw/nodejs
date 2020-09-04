const Product = require('../models/product');
const User = require('../models/user.js');
const { validationResult } = require('express-validator');
// const mongoose = require('mongoose');
const fileHelper = require('../util/fileHelper.js');
const ITEMS_PER_PAGE = 3;
let totalItems = 0;
let totalPages = 0;

exports.getAddProduct = (req, res, next) => {
    if (!req.session.isLogined) {
        return res.redirect('/login');
    }
    // console.log(req.user.id);
    res.render('admin/edit-product', {
        docTitle: '添加产品',
        activeAddProduct: true,
        breadcrumb: [
            { name: '首页', url: '/', hasBreadcrumbUrl: true },
            { name: '添加产品', hasBreadcrumbUrl: false }
        ],
        errorMessage: null,
        hasErrors: false,
        validationErrors: [],
        editing: false
        // isAuthenticated: req.session.isLogined
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    if (!editMode) {
        return res.redirect('/');
    }

    const productId = req.params.productId;
    // console.log()
    // 魔法关联方法
    Product.findById(productId)
        .then(product => {
            // const product = products[0];
            // console.log(products);
            // console.log(productId);
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                docTitle: '修改产品',
                activeProductManage: true,
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    { name: '修改产品', hasBreadcrumbUrl: false }
                ],
                editing: editMode,
                product,
                isAuthenicated: req.session.isLogined,
                hasErrors: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    // Product.findByPk(productId).then(product => {
    //     if (!product) {
    //         return res.redirect('/');
    //     }
    //     res.render('admin/edit-product', {
    //         docTitle: '修改产品',
    //         activeProductManage: true,
    //         breadcrumb: [
    //             { name: '首页', url: '/', hasBreadcrumbUrl: true },
    //             { name: '修改产品', hasBreadcrumbUrl: false }
    //         ],
    //         editing: editMode,
    //         product
    //     });
    // });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    // const imageUrl = req.body.image;
    const image = req.file;

    const price = req.body.price;
    const userId = req.user; // 也可以使用req.user._id mongoose会直接将user的id进行关联设置操作，这是mongoose的内部机制
    //  因为产品的数据模型是一个Object，所以我们在实例化产品的时候，只需要传入一个Object对象就行
    // console.log(imageUrl);
    if (!image) {
        return res.status('422').render('admin/edit-product', {
            docTitle: '添加产品',
            breadcrumb: [
                { name: '首页', url: '/', hasBreadcrumbUrl: true },
                { name: '添加产品', hasBreadcrumbUrl: false }
            ],
            errorMessage: '没有上传图片或者图片格式非法',
            product: { title, price, description },
            validationErrors: [],
            editing: false,
            hasErrors: true
        });
    }
    const imageUrl = image.path;
    const errors = validationResult(req); // 在所有请求查找
    if (!errors.isEmpty()) {
        // console.log(errors.array());
        // 422页面重新渲染
        return res.status('422').render('admin/edit-product', {
            docTitle: '添加产品',
            breadcrumb: [
                { name: '首页', url: '/', hasBreadcrumbUrl: true },
                { name: '添加产品', hasBreadcrumbUrl: false }
            ],
            errorMessage: errors.array()[0].msg,
            product: { title, price, imageUrl, description },
            validationErrors: errors.array(),
            editing: false,
            hasErrors: true
        });
    }

    const product = new Product({ title, price, imageUrl, description, userId });
    product
        .save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            // console.log('新增产品出错');
            // console.log(err);
            // return res.status('422').render('admin/edit-product', {
            //     docTitle: '添加产品',
            //     breadcrumb: [
            //         { name: '首页', url: '/', hasBreadcrumbUrl: true },
            //         { name: '添加产品', hasBreadcrumbUrl: false }
            //     ],
            //     errorMessage: '数据库错误，请稍候再试',
            //     product: { title, price, imageUrl, description },
            //     validationErrors: [],
            //     editing: false,
            //     hasErrors: true
            // });

            // res.redirect('/500');

            // 利用Express中间实现500
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const image = req.file;

    // const product = new Product(title, imageUrl, description, price);

    // product.save(productId);
    // res.redirect('/');

    // Product.findByPk(productId)
    //     .then(product => {
    //         product.title = title;
    //         product.price = price;
    //         product.imageUrl = imageUrl;
    //         product.description = description;
    //         return product.save();
    //     })
    //     .then(result => {
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });

    // setProducts是用来更新updateAt、UserId ？？？？
    // req.user.setProducts([1, 2]).then(user => {
    //     console.log(user);
    // });

    const errors = validationResult(req); // 在所有请求查找
    if (!errors.isEmpty()) {
        // console.log(errors.array());
        // 422页面重新渲染
        return res.status('422').render('admin/edit-product', {
            docTitle: '修改产品',
            breadcrumb: [
                { name: '首页', url: '/', hasBreadcrumbUrl: true },
                { name: '修改产品', hasBreadcrumbUrl: false }
            ],
            errorMessage: errors.array()[0].msg,
            product: { title, price, description, _id: productId },
            validationErrors: errors.array(),
            editing: true,
            hasErrors: true
        });
    }

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            // console.log(product);

            product.title = title;
            product.price = price;
            product.description = description;

            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }

            // const product = new Product(title, price, imageUrl, description);
            product
                .save()
                .then(result => {
                    res.redirect('/admin/products');
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

    // Product.update({ title, price, imageUrl, description }, { where: { id: productId } })
    //     .then(([num]) => {
    //         console.log(num);
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) {
                next(new Error('产品没有找到'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: productId, userId: req.user._id });
        })
        // 第三种删除方式

        .then(result => {
            return req.user.clearCart();
        })
        .then(result => {
            // res.redirect('/admin/products');
            res.json({ message: 'success' });
        })
        .catch(err => {
            res.json({ message: 'fail' });
        });
};

exports.postDeleteProduct = (req, res, next) => {
    // const productId = req.body.productId;
    // console.log(productId);
    // Product.deleteById(productId);
    // res.redirect('/admin/products');

    const productId = req.body.productId;

    // Product.deleteById(productId);

    // res.redirect('/admin/products');

    // 第二种删除方式
    // Product.findByPk(productId)
    //     .then(product => {
    //         return product.destroy();
    //     })
    //     .then(result => {
    //         res.redirect('admin/products');
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });

    Product.findById(productId)
        .then(product => {
            if (!product) {
                next(new Error('产品没有找到'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: productId, userId: req.user._id });
        })
        // 第三种删除方式

        .then(result => {
            return req.user.clearCart();
        })
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProducts = (req, res, next) => {
    // 这里的[products]与不使用中括号
    // Product.findAll().then(products => {
    //     res.render('admin/products', {
    //         pros: products,
    //         docTitle: '产品管理',
    //         activeProductManage: true,
    //         breadcrumb: [
    //             { name: '首页', url: '/', hasBreadcrumbUrl: true },
    //             { name: '产品管理', hasBreadcrumbUrl: false }
    //         ]
    //     });
    // });

    // Product.find()
    //     // .lean() // 利用mongoose的lean查询模式  将mongoose的结果对象转成javaScript的普通对象模式，这个时候输出的是纯粹的js对象
    //     .then(async products => {
    //         for (let product of products) {
    //             await User.findById(product.userId).then(user => {
    //                 product.user = user;
    //                 // console.log(product);
    //             });
    //         }
    //         console.log(products);
    //         res.render('admin/products', {
    //             pros: products,
    //             docTitle: '产品管理',
    //             activeProductManage: true,
    //             breadcrumb: [
    //                 { name: '首页', url: '/', hasBreadcrumbUrl: true },
    //                 { name: '产品管理', hasBreadcrumbUrl: false }
    //             ]
    //         });
    //     });
    const page = +req.query.page || 1;
    const customLabels = {
        totalDocs: 'totalPages',
        docs: 'pros',
        page: 'currentPage'
    };

    Product.paginate({ userId: req.user._id }, { page, limit: ITEMS_PER_PAGE, customLabels })

        // .lean() // 利用mongoose的lean查询模式  将mongoose的结果对象转成javaScript的普通对象模式，这个时候输出的是纯粹的js对象
        // .select('title price') // 设置Prodct这个数据模型的字段显示，同样不要显示_id的内容，也可以使用-_id
        // .populate('userId', 'name -_id') // -_id表示不显示_id的内容，只显示name的信息
        .then(products => {
            // console.log(products);
            res.render('admin/products', {
                ...products,
                docTitle: '产品管理',
                activeProductManage: true,
                breadcrumb: [
                    { name: '首页', url: '/', hasBreadcrumbUrl: true },
                    { name: '产品管理', hasBreadcrumbUrl: false }
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
