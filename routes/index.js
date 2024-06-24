const express = require('express');
const moment = require('moment')
const UniSMS = require('unisms').default
const { UserModel } = require('../model/usersModel');
const bcrypt = require('bcrypt')
const myCrypto = require('../crypto/crypto')
const crypto = require('crypto');
const { Promise } = require('mongoose');
const eccrypto = require("eccrypto"); //椭圆曲线加密库
const jwt = require('jsonwebtoken');
const multer = require('multer');
var {authenticateToken} = require('../middleware/middleware');
const SM4 = require('../methods/SM4');
const fs = require('fs');
const fsextra = require('fs-extra');

var router = express.Router();

function generateIV() {
  return crypto.randomBytes(16); 
}
function stringToByteArray(str) {
  const byteArray = [];
  for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      // 对于多字节字符，可以根据具体需求进行处理
      byteArray.push(charCode & 0xFF); // 只取低8位作为字节
  }
  return byteArray;
}

// 初始化
const client = new UniSMS({
  accessKeyId: 'your_accessKeyId',
  // accessKeySecret: 'your access key secret',  // 若使用简易验签模式请删除此行
})

const secretKey = '151e6e8b37f480f358f9689c535735496255b5f0a9207355ba8bd3aa9ae8144b';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});


router.get('/key', function(req,res,next){
  res.render('key');
})

router.get('/register', function(req,res,next){
  res.render('register');
})

router.post('/protect',function(req,res,next){
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader;
  if (!token) {
      return res.json({ code: 201 ,error: 'Token not provided' });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
      return res.json({ code: 201 ,error: 'Invalid token' });
      }
      req.userId = decoded.userId;
      return res.json({ code: 200 });
  });
})

router.post('/key',async function(req,res,next){
  console.log(req.body);
  UserModel.find({username:req.body.username})
  .then((response)=>{
    console.log(response);
    if(response.length === 0){
      res.status(401).json({
        msg:'登录失败,用户似乎不存在哦~',
      })
    }
    response.forEach(async element => {
      if(await myCrypto.hashPassword(element.salt,req.body.password) == element.password){
        console.log('success');
        const token = jwt.sign({ userId: element._id }, secretKey, { expiresIn: '1h' });
        res.json({
          msg: `登录成功~~`,
          token: token
        })
      }else{
        res.status(401).json({
          msg:'密码不正确！！',
        })
      }
    }); 
  })
  .catch((error)=>{
    console.log(error);
    res.render(error)
  })
})

router.post('/register', async function(req,res,next){
  console.log(req.body);
  // 生成随机的盐值
  const salt = await bcrypt.genSalt(10);
  const passwordCryptoed = await myCrypto.hashPassword(salt,req.body.password);
  console.log(passwordCryptoed);
  UserModel.create({
      username:req.body.username,
      password:passwordCryptoed,
      salt:salt
  })
  .then((response)=>{
    console.log(response);
    res.render('success', {
      msg: '注册成功~~',
      url: '/key'
    })
  })
  .catch((error)=>{
    console.log(error);
    res.render(error)
  })
})

router.get('/email', function(req,res,next){
  res.render('email');
})

router.post('/email', function(req,res,next){
  //读取 cookie
  console.log(req.cookies);
  if(req.body.password === req.cookies.vertifycode){
    const token = jwt.sign({ userId: req.body.phoneNumber }, secretKey, { expiresIn: '1h' });
    res.json({
      msg: `登录成功~~`,
      token:token
    })
  }else{
    res.json({
      msg:'验证码不正确！！',
    })
  }
})

router.post('/vertifycode', function(req,res,next){
  console.log(req.body);
  let vertifyCode = Math.floor(Math.random() * 9000) + 1000;
  res.cookie('vertifycode', vertifyCode, { maxAge: 15 * 60 * 1000 });
  // 发送短信
  client.send({
    to: req.body.phoneNumber,
    signature: 'your_signature',
    templateId: 'pub_verif_ttl3',
    templateData: {
      code: vertifyCode,
      ttl: 15
    },
  })
  .then(ret => {
    console.info('Result:', ret)
  })
  .catch(e => {
    console.log('error:',e)
  })
  res.send('设置cookie!!')
})

router.get('/usbkey', function(req,res,next){
  res.render('usbkey');
})
router.get('/p2key', function(req,res,next){
  var privateKey = eccrypto.generatePrivate();
  var publicKey = eccrypto.getPublic(privateKey);
  res.json({
    privateKey:privateKey,
    publicKey:publicKey,
  })
})
router.post('/ecsign', function(req,res,next){
  let privateKey = req.body.privatekey;
  console.log(Buffer.from(privateKey.data, msg));
  var str = "message to sign";
  // Always hash you message to sign!
  var msg = crypto.createHash("sha256").update(str).digest();
  eccrypto.sign(Buffer.from(privateKey.data), msg).then(function(sig) {
    res.json({
      sig:sig,
      msg:msg,
    })
  });
})

router.post('/pubkey', function(req,res,next){
  console.log(req.body);
  // 生成随机的Buffer
  const randomBuffer = crypto.randomBytes(32); // 这里的数字表示生成的字节数
  // 将Buffer转换为Base64编码
  const randomBase64 = randomBuffer.toString('base64');
  let data = {
    randomNum: randomBase64
  }
  res.json(data)
})

router.post('/vertifySign', function(req,res,next){
  console.log('body:',req.body);
  eccrypto.verify(Buffer.from(req.body.pubkey.data), Buffer.from(req.body.randomnum.data), Buffer.from(req.body.signature.data))
  .then(function() {
    console.log("验签成功");
    const token = jwt.sign({ userId: req.body.user }, secretKey, { expiresIn: '1h' });
    res.json({
      status:'success',
      token:token
    })
  }).catch(function() {
    console.log("验签失败");
    res.json({
      status:'fail'
    })
  });
})

router.get('/cryptofile',function(req,res,next){
  res.render('cryptofile');
})

// 创建一个存储文件的实例
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/'); // 文件存储的目录
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname); // 保持原始文件名
  }
});
// 配置 multer 中间件，用于处理文件上传
const upload = multer({ storage: storage });

// 处理加密服务
router.post('/crypted', upload.single('file1'), (req, res) => {
  console.log('req.file:',req.file);
  let { key } = req.body;
  let {originalname} = req.file;
  let randomiv = generateIV();
  console.log('randomiv:',randomiv);
  const buffer = fs.readFileSync(`./uploads/${originalname}`);
  console.log('buffer',buffer);
  const byteArray = [...buffer];
  const key_ByteArray = stringToByteArray(key);
  console.log('1:',[...randomiv]);
  const cryptedHexString = SM4.sm4(byteArray,key_ByteArray,1,{padding:'pkcs#7', mode:'cbc', iv:[...randomiv], output:'string'});
  const miwenjiegou = randomiv.toString('hex') + cryptedHexString + originalname.split('.')[1];
  fs.writeFileSync(`./download/${originalname.split('.')[0]}`, miwenjiegou, 'utf8', (err) => {
      if (err) {
          console.error('文件保存失败:', err);
      } else {
          console.log('文件保存成功:', filename);
      }
  });
  res.download(`./download/${originalname.split('.')[0]}`,(err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    } else {
      fsextra.emptyDir('uploads/');
      fsextra.emptyDir('download/');
    };
  });
});

// 处理解密服务
router.post('/decrypted', upload.single('file2'), (req, res) => {
  console.log('req.file:',req.file);
  let { key } = req.body;
  let {originalname} = req.file;
  const key_ByteArray = stringToByteArray(key);
  const buffer = fs.readFileSync(`./uploads/${originalname}`).toString('utf-8');
  const randomiv = buffer.slice(0,32);
  const geshi = buffer.slice(-3);
  const decryptedHexString = SM4.sm4(buffer.slice(32,-3),key_ByteArray,0,{padding:'pkcs#7', mode:'cbc', iv:[...Buffer.from(randomiv,'hex')], output:'string'});
  const decryptedBuffer = Buffer.from(decryptedHexString, 'hex');
  fs.writeFileSync(`./download/${originalname.split('.')[0]}.${geshi}`, decryptedBuffer, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('decrypted_file has been saved');
    }
  });
  res.download(`./download/${originalname.split('.')[0]}.${geshi}`,(err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    } else {
      fsextra.emptyDir('uploads/');
      fsextra.emptyDir('download/');
    };
  });
});

module.exports = router;
