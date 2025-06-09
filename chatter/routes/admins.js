var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const AdminsController = require('../controllers/adminsController');


router.get('/', ensureAuthenticated, AdminsController.listAdmins);

router.get('/create', ensureAuthenticated, AdminsController.getRegisterForm);

router.post('/create', ensureAuthenticated, AdminsController.registerAdmin);

router.delete('/delete/:id', ensureAuthenticated, AdminsController.deleteAdmin);

module.exports = router;
