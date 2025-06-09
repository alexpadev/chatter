var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const BiosController = require('../controllers/biosController');

router.get('/list', ensureAuthenticated, BiosController.listBios);

router.get('/list/:id', ensureAuthenticated, BiosController.viewBios);

router.get('/update/:id', ensureAuthenticated, BiosController.showUpdateForm);

router.post('/update/:id', ensureAuthenticated, BiosController.updateBios);

router.delete('/delete/:id', ensureAuthenticated, BiosController.deleteBios);


module.exports = router;
