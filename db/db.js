/**
 * 
 * @param {*} success 
 * @param {*} error 
 */
module.exports = function (success,error){
    if(typeof error !== 'function'){
        error = ()=>{
            console.log('链接失败');
        }
    }
    //1. 安装 mongoose
    //2. 导入 mongoose
    const mongoose = require('mongoose');
    const {DBHOST,DBPORT,DBNAME} = require('../config/novelsConfig')
    //3. 连接数据库 bilibili是集合名 如果数据库没有这个集合会自动创建
    mongoose.connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`);
    //4. 设置连接回调
    //连接成功
    mongoose.connection.on('open', () => {
        success();
    });
    //连接出错
    mongoose.connection.on('error', () => {
        error();
    });
    //连接关闭
    mongoose.connection.on('close', () => {
        console.log('连接关闭');
    });
}