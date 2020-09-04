// const { Sequelize } = require('sequelize');

// const sequelize = require('../util/database.js');

// const User = sequelize.define('User', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: Sequelize.STRING,
//     email: Sequelize.STRING
// });

// module.exports = User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', require: true },
                quantity: { type: Number, require: true }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    // 需要找到购物车项目中当前产品的下标位置。
    const cartProductIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === product._id.toString();
    });
    // 初始购物车产品购买数量
    let newQuantity = 1;
    // 将原来的购物车清单进行重新到赋值操作
    const updateCartItem = [...this.cart.items];

    // 如果购物的产品并没有存在于原来的购物车清单中
    if (cartProductIndex === -1) {
        updateCartItem.push({
            productId: product._id, // 直接传递字符串一样的id信息？？？？
            quantity: newQuantity
        });
    } else {
        // 如果已经加入过购物车当中，我们需要让产品的数量+1
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updateCartItem[cartProductIndex].quantity = newQuantity;
    }
    // 设置购物车购买的产品列表清单项
    const updatedCart = {
        items: updateCartItem
    };

    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.deleteProductFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;

    return this.save();
};

userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');

// const ObjectID = mongodb.ObjectID;

// class User {
//     constructor(name, email, cart, id) {
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this.id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const db = getDb();

//         // 需要找到购物车项目中当前产品的下标位置。
//         const cartProductIndex = this.cart.items.findIndex(item => {
//             return item.productId.toString() === product._id.toString();
//         });
//         // 初始购物车产品购买数量
//         let newQuantity = 1;
//         // 将原来的购物车清单进行重新到赋值操作
//         const updateCartItem = [...this.cart.items];

//         // 如果购物的产品并没有存在于原来的购物车清单中
//         if (cartProductIndex === -1) {
//             updateCartItem.push({
//                 productId: new ObjectID(product._id),
//                 quantity: newQuantity
//             });
//         } else {
//             // 如果已经加入过购物车当中，我们需要让产品的数量+1
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updateCartItem[cartProductIndex].quantity = newQuantity;
//         }
//         // 设置购物车购买的产品列表清单项
//         const updatedCart = {
//             items: updateCartItem
//         };
//         // 对用户信息的修改，实现的是购物车清单更新的操作，判定条件是用户的id数据
//         return db.collection('users').updateOne({ _id: new ObjectID(this.id) }, { $set: { cart: updatedCart } });
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new ObjectID(userId) });
//     }

//     static findLastUser() {
//         const db = getDb();
//         return db
//             .collection('users')
//             .find()
//             .limit(1)
//             .toArray()
//             .then(users => {
//                 const user = users[0];
//                 return user;
//             });
//     }

//     getCart() {
//         const db = getDb();

//         // 从用户购物车中选出所有的产品的编号信息
//         const productIds = this.cart.items.map(item => item.productId);

//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
//                     const quantity = this.cart.items.find(item => {
//                         return item.productId.toString() === product._id.toString();
//                     }).quantity;
//                     return {
//                         ...product,
//                         quantity
//                     };
//                 });
//             });
//     }

//     deleteProductFromCart(productId) {
//         const db = getDb();

//         const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());

//         return db.collection('users').updateOne({ _id: new ObjectID(this.id) }, { $set: { cart: { items: updatedCartItems } } });
//     }

//     createOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectID(this.id),
//                     name: this.name
//                 }
//             };
//             return db
//                 .collection('orders')
//                 .insertOne(order)
//                 .then(result => {
//                     return db.collection('users').updateOne({ _id: new ObjectID(this.id) }, { $set: { cart: { items: [] } } });
//                 });
//         });
//     }

//     getOrder() {
//         const db = getDb();

//         return db
//             .collection('orders')
//             .find({ 'user._id': new ObjectID(this.id) })
//             .toArray();
//     }
// }

// module.exports = User;
