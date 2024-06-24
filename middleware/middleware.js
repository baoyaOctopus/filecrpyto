// 检查token中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ code: 201 ,error: 'Token not provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
        return res.status(403).json({ code: 201 ,error: 'Invalid token' });
        }
        
        req.userId = decoded.userId;
        next();
    });
}

module.exports = { authenticateToken }