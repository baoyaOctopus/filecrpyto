const mongoose = require('mongoose')
//5. 创建文档结构对象 设置集合中文档的属性以及属性的约束
let PhoneSchema = new mongoose.Schema({
    phoneNumber:{
        type:String,
        required:true,
        unique
    },
    vertifyCode:{
        type:String,
    },
});
//6. 创建文档模型对象  对文档操作的封装对象
let PhoneModel = mongoose.model('User', PhoneSchema);
module.exports={
    PhoneModel
}