const express = require('express');
const router = express.Router();
const { ensureJWTAuthenticated } = require("../../middleware/jwt-auth");
const kissController = require('../../controllers/api/kissController');

router.post('/', kissController.createKiss);

router.delete('/', kissController.deleteKiss);

router.get('/user/:email', kissController.getUserKisses);

router.get('/', ensureJWTAuthenticated, kissController.getKissesForCurrentUser);

router.get('/bio/:bioId', kissController.getKissesForBio);
router.get('/bios', kissController.getAllBioKisses);

module.exports = router;
