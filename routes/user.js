'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

const middleware_upImage = require("../middlewares/uploadImage");
const md_multer = middleware_upImage.uploadImage();



///rutas de ppruba
router.get('/probando', UserController.probando);
router.post('/testeando', UserController.testeando);

//rutas de usuario

router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_multer.single("file0")], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);


module.exports = router;