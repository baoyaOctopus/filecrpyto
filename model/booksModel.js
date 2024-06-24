const mongoose = require('mongoose')
//5. 创建文档结构对象 设置集合中文档的属性以及属性的约束
let BookSchema = new mongoose.Schema({
    title: String,
    author: String,
    price: Number
});
//6. 创建文档模型对象  对文档操作的封装对象
let BookModel = mongoose.model('book', BookSchema);
module.exports={
    BookModel
}