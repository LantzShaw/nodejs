const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error.js');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = 'mongodb://localhost/nodejs-shop';
const csrf = require('csurf');
const flash = require('express-flash-messages');
const multer = require('multer');

// const Product = require('./models/product.js');
// const User = require('./models/user.js');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

// const expressHbs = require('express-handlebars');

const app = express();

const csrfProtection = csrf();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
// db.getConnection()
//     .then(conn => {
//         const res = conn.query(`SELECT * FROM products`);
//         conn.release();
//         return res;
//     })
//     .then(result => {
//         // 返回第一个部分是信息记录
//         // 第二部分是数据库库表接口相关信息
//         console.log(result);
//     })
//     .catch(err => {
//         console.log(err);
//     });

// 加密的、更安全的操作方式
// db.execute(`SELECT * FROM products`)
//     .then(result => {
//         console.log(result);
//     })
//     .catch(err => {
//         console.log(err);
//     });

// app.engine('hbs', expressHbs({ extname: '.hbs', partialsDir: ['views/partials'] }));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // null表示错误，images表示存储目录
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        const uniqueprefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueprefix + '-' + file.originalname);
    }
});

// 这个是重写fileFilter函数吗,，这里的cd哪里设置的
// 这是我们自定义的函数？？
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

// urlencoded  对应的是form表单enctype的application/x-www-form-urlencorded，现在enctype切换成了multipart-form-data，req.body自然获取不到表单提交的数据，也无法获取crftoken值的内容
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(multer({ dest: 'images' }).single('image'));
app.use(multer({ storage, fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
    session({
        secret: 'random secret string',
        resave: false, // 每次请求重新设置session cookie
        saveUninitialized: false, // 无论有没有session cookie，每次请求都会设置session、cookie
        cookie: {
            httpOnly: true
        },
        store
    })
);

// csrf默认get请求为安全的，默认的post请求则为不安全的
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    // res.locals expressjs官网，对公开请求的信息，例如：身份验证等操作  本地变量
    res.locals.isAuthenticated = req.session.isLogined;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    // findOne()是？？？？查找最后一个
    User.findById(req.session.user._id)
        .then(user => {
            // throw new Error('程序中断');

            if (!user) {
                // destroy方法里面的回调函数怎么执行的 ？？
                return req.session.destroy(err => {
                    return res.status(404).send('找不到指定用户，刷新页面重新登录');
                });
            }
            // console.log(user);
            req.user = user;
            // console.log(req.user);
            next();
        })
        .catch(err => {
            // ???
            // throw new Error(err); // throw抛出错误是阻塞的
            next(new Error(err)); // next是Epress中间件中的一个函数内容，它可以接收一个error信息的参数，在下一个中间件中就可以对erro的信息进行处理
        });
});

app.use(shopRoutes);
app.use(authRoutes);

app.use('/admin', adminRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    // res.redirect('/500');

    res.status(500).render('500', { docTitle: '服务器错误', error, isAuthenicated: req.session.isLogined });
});

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true })
    .then(result => {
        // User.findOne().then(user => {
        //     if (!user) {
        //         const user = new User({
        //             name: 'Lantz',
        //             email: 'lantzshaw@163.com',
        //             cart: {
        //                 items: []
        //             }
        //         });
        //         user.save();
        //     }
        // });
        // 返回的是mongoose的连接对象
        // console.log(result);
        app.listen(3000, () => {
            console.log('App listening on port 3000');
        });
    })
    .catch(err => {
        console.log(err);
    });
