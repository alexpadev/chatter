var express = require('express');
var router = express.Router();
const UsuarisController = require('../../controllers/api/usuarisController');

const { ensureJWTAuthenticated } = require('../../middleware/jwt-auth');

router.get('/', ensureJWTAuthenticated, UsuarisController.list);
router.get('/:id', ensureJWTAuthenticated, UsuarisController.get);
router.put('/:id', ensureJWTAuthenticated, UsuarisController.updateProfile);

module.exports = router;
