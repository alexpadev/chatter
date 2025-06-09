const Message = require('../../models/Message');

const ChatController = {
  clientCount: async (req, res, next) => {
    try {
      const chat = req.app.locals.chat;
      if (!chat) {
        return res.status(500).json({ error: 'Chat instance not found' });
      }

      const clients = chat.get_clients();
      res.json({ clients });
    } catch (error) {
      next(error);
    }
  },

  getMessages: async (req, res, next) => {
    try {
      if (req.query.to) {
        if (req.query.to === "gemini") {
          const messages = await Message.find({
            $or: [
              { to: "gemini", from: req.user.email },
              { from: "gemini", to: req.user.email }
            ]
          }).sort({ createdAt: 1 });
          return res.json(messages);
        } else if (req.query.to == "group") {
          const messages = await Message.find({
            to: req.query.to,
          });
          return res.json(messages);
        } else if (req.query.to == "self") {
          const messages = await Message.find({
            to: req.query.to,
            from: req.user.email
          });
          return res.json(messages);
        }

      }
      const user1 = req.query.user1;
      const user2 = req.query.user2; 

      if (!user1) {
        return res.status(400).json({ error: "El correu de l'altre usuari és necessari" });
      }
      
      if (user2 === user1) {
        return res.status(400).json({ error: "La conversa ha de ser entre dos usuaris diferents" });
      }


      let messagesDB = await Message.find({
        to: user2,
        from : user1
      })

      let messagesDB2 = await Message.find({
        to: user1,
        from : user2
      });
      let sorted = [...messagesDB, ...messagesDB2].sort((a, b) => a.createdAt - b.createdAt);
      res.json(sorted);

    } catch (error) {
      next(error);
    }
  }
};

module.exports = ChatController;
