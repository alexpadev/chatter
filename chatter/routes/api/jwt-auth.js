var express = require('express');
var router = express.Router();
const JWTAuthController = require('../../controllers/api/jwtAuthController');

const { ensureJWTAuthenticated } = require('../../middleware/jwt-auth');

router.post('/login', JWTAuthController.login);
router.delete('/logout', ensureJWTAuthenticated, JWTAuthController.logout);
router.post('/register', JWTAuthController.register);
router.post('/password', ensureJWTAuthenticated, JWTAuthController.changePassword);

module.exports = router;
