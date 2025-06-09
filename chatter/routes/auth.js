var express = require('express');
var auth = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const authController = require('../controllers/authController');

auth.get('/login', (req, res) => {
  res.render('auth/login');
});

auth.post('/login', authController.login);

auth.get('/logout', authController.logout);

auth.get('/password', ensureAuthenticated, authController.changePassword);

auth.post('/password', ensureAuthenticated, authController.updatePassword); 

module.exports = auth;
