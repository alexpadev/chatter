var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const UsuarisController = require('../controllers/usuarisController');

router.get('/list', ensureAuthenticated, UsuarisController.listUsers);

router.get('/list/:id', ensureAuthenticated, UsuarisController.viewUser);

router.get('/update/:id', ensureAuthenticated, UsuarisController.showUpdateForm);

router.post('/update/:id', ensureAuthenticated, UsuarisController.updateUser);

router.delete('/delete/:id', ensureAuthenticated, UsuarisController.deleteUser);

router.get('/', UsuarisController.listAdmins);

router.get('/register', UsuarisController.getRegisterForm);

router.post('/register', UsuarisController.registerUser);

module.exports = router;
