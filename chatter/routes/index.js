var express = require('express');
var router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');
const IndexController = require('../controllers/indexController')
const authRoutes = require('./auth.js')

router.get('/', ensureAuthenticated, IndexController.index);

router.get('/dashboard', forwardAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user })
});

router.get('/auth', authRoutes);

module.exports = router;