const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        description: { type: String, required: true },
        // mongodb的关联关系有两种，一种是嵌入式，另一种则是指向类型
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true } // User指向的是User的数据模型名称
        // user: {}
    },
    {
        // 自定义__v的名称，它是内部的文档版本信息
        // versionKey: 'vk',
        // 将versionKey删除
        versionKey: false
    }
);
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
