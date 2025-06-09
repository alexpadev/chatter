var express = require('express');
var router = express.Router();
const BiosController = require('../../controllers/api/biosController');
const { ensureJWTAuthenticated } = require('../../middleware/jwt-auth');

router.get('/', ensureJWTAuthenticated, BiosController.list);
router.get('/mine', ensureJWTAuthenticated, BiosController.getMyBios);
router.get('/:id', ensureJWTAuthenticated, BiosController.get);
router.post('/', ensureJWTAuthenticated, BiosController.createBio);
router.put('/:id', ensureJWTAuthenticated, BiosController.updateBio);
router.delete('/:id', ensureJWTAuthenticated, BiosController.deleteBio);

module.exports = router;
