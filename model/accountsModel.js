const mongoose = require('mongoose')
//5. 创建文档结构对象 设置集合中文档的属性以及属性的约束
let AccountSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    time:Date,
    type:{
        type:Number,
        default:-1
    },
    account:{
        type:Number,
        required:true,
    },
    remarks:{
        type:String
    }
});
//6. 创建文档模型对象  对文档操作的封装对象
let AccountModel = mongoose.model('Account', AccountSchema);
module.exports={
    AccountModel
}