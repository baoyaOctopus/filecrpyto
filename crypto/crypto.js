const bcrypt = require('bcrypt');

async function hashPassword(salt,password) {
    try {
        // 使用盐值和密码进行哈希加密
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error('密码加密过程出现错误');
    }
}
// 函数：将密码进行加盐哈希加密
module.exports = { hashPassword }
