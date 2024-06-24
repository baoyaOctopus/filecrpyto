const mongoose = require('mongoose')
//5. 创建文档结构对象 设置集合中文档的属性以及属性的约束
let UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    salt:{
        type:String,
        require:true
    }
});
//6. 创建文档模型对象  对文档操作的封装对象
let UserModel = mongoose.model('User', UserSchema);
module.exports={
    UserModel
}