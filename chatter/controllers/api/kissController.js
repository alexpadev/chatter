const Kiss = require('../../models/Kiss');


const kissController = {
  createKiss: async (req, res) => {
    const { fromEmail, targetEmail, targetBio } = req.body;
    if (!fromEmail || (!targetEmail && !targetBio)) {
      return res.status(400).json({ error: 'Paràmetres obligatoris: fromEmail i targetEmail o targetBio' });
    }
    try {
      const existing = await Kiss.findOne({ fromEmail, targetEmail, targetBio });
      if (existing) {
        return res.status(400).json({ error: 'Ja s\'ha fet kiss prèviament' });
      }
      const kiss = new Kiss({ fromEmail, targetEmail, targetBio });
      await kiss.save();
      res.json({ message: 'Kiss afegit correctament', kiss });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  deleteKiss: async (req, res) => {
    const { fromEmail, targetEmail, targetBio } = req.body;
    if (!fromEmail || (!targetEmail && !targetBio)) {
      return res.status(400).json({ error: 'Paràmetres obligatoris: fromEmail i targetEmail o targetBio' });
    }
    try {
      const result = await Kiss.findOneAndDelete({ fromEmail, targetEmail, targetBio });
      if (!result) {
        return res.status(404).json({ error: 'Kiss no trobat' });
      }
      res.json({ message: 'Kiss desfet correctament' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  getKissesForBio: async (req, res) => {
    const bioId = req.params.bioId;
    try {
      const kisses = await Kiss.find({ targetBio: bioId });
      const count = kisses.length;
      const fromEmails = kisses.map(k => k.fromEmail);
      res.json({ count, fromEmails });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  getUserKisses: async (req, res) => {
    const email = req.params.email;
    try {
      const kisses = await Kiss.find({ targetEmail: email });
      const count = kisses.length;
      const fromEmails = kisses.map(k => k.fromEmail);
      res.json({ count, fromEmails });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },


  getKissesForCurrentUser: async (req, res) => {
    try {
      const kisses = await Kiss.find({ fromEmail: req.user.email });
      const count = kisses.length;
      res.json({ kisses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  getKissEmails: async (req, res) => {
    try {
      const kisses = await Kiss.find({ fromEmail: req.user.email });
      const emails = kisses.map(k => k.targetEmail);
      res.json({ emails });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  getKissesForBio: async (req, res) => {
    const bioId = req.params.bioId;
    try {
      const kisses = await Kiss.find({ targetBio: bioId });
      const count = kisses.length;
      const fromEmails = kisses.map(k => k.fromEmail);
      res.json({ count, fromEmails });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  getAllBioKisses: async (req, res) => {
    try {
      const kisses = await Kiss.find();
      const count = kisses.length;
      res.json({ count, kisses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }

};

module.exports = kissController;
