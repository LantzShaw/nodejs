// const rootDir = require('../util/path');
// const fs = require('fs');
// const path = require('path');
// const dirPath = path.join(rootDir, 'data');
// const filePath = path.join(dirPath, 'cart.json');
// const { v4: uuidv4 } = require('uuid');

// const getCartFromFile = cb => {
//     Cart.checkFile().then(result => {
//         if (result) {
//             fs.readFile(filePath, (err, data) => {
//                 if (err) {
//                     cb([]);
//                 }
//                 cb(JSON.parse(data));
//             });
//         }
//     });
// };

// class Cart {
//     constructor(title, imageUrl, description, price) {
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this.price = price;
//     }

//     static checkFile = () => {
//         const promise = new Promise((resolve, reject) => {
//             fs.exists(dirPath, result => {
//                 if (!result) {
//                     fs.mkdir(dirPath, err => {
//                         if (!err) {
//                             fs.writeFile(
//                                 filePath,
//                                 '{"products": [], "totalPrice": 0}',
//                                 err => {
//                                     resolve(true);
//                                 }
//                             );
//                         }
//                     });
//                 } else {
//                     fs.exists(filePath, blCheckFile => {
//                         if (!blCheckFile) {
//                             fs.writeFile(
//                                 filePath,
//                                 '{"products": [], "totalPrice": 0}',
//                                 err => {
//                                     resolve(true);
//                                 }
//                             );
//                         } else {
//                             resolve(true);
//                         }
//                     });
//                 }
//             });
//         });

//         return promise;
//     };

//     static addProduct(id, productPrice) {
//         getCartFromFile(cart => {
//             const existsProductIdex = cart.products.findIndex(
//                 prod => prod.id === id
//             );
//             let updatedProduct = false;

//             if (existsProductIdex === -1) {
//                 updatedProduct = { id: id, qty: 1 };
//                 cart.products.push(updatedProduct);
//             } else {
//                 let existsProduct = cart.products[existsProductIdex];
//                 updatedProduct = { ...existsProduct };
//                 updatedProduct.qty = existsProduct.qty + 1;
//                 cart.products[existsProductIdex] = updatedProduct;
//             }

//             cart.totalPrice = cart.totalPrice + +productPrice;

//             fs.writeFile(filePath, JSON.stringify(cart), err => {
//                 console.log(err);
//             });
//         });
//     }

//     static getCart(cb) {
//         getCartFromFile(cart => {
//             cb(cart);
//         });
//     }

//     static deleteProduct(id, productPrice) {
//         getCartFromFile(cart => {
//             const updateCart = { ...cart };

//             const product = updateCart.products.find(prod => prod.id === id);
//             if (!product) {
//                 return;
//             }

//             const productQty = product.qty;

//             updateCart.products = updateCart.products.filter(
//                 prod => prod.id !== id
//             );
//             updateCart.totalPrice =
//                 updateCart.totalPrice - productQty * productPrice;

//             fs.writeFile(filePath, JSON.stringify(updateCart), err => {
//                 console.log(err);
//             });
//         });
//     }
// }

// module.exports = Cart;

// sequelize

const { Sequelize } = require('sequelize');

const sequelize = require('../util/database.js');

const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Cart;
