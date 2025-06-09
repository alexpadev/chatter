var express = require('express');
var router = express.Router();
const ChatController = require('../../controllers/api/chatController');

const { ensureJWTAuthenticated } = require('../../middleware/jwt-auth');

router.get('/online', ensureJWTAuthenticated, ChatController.clientCount);

router.get('/messages', ensureJWTAuthenticated, ChatController.getMessages);


module.exports = router;

