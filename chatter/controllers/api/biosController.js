const Bio = require('../../models/Bio');

const bioController = {
  getMyBios: async (req, res) => {
    console.log("HOLa????")
    try {
      const bios = await Bio.find({ 'autor.email': req.user.email });
      res.json(bios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  createBio: async (req, res) => {
    const { nom, url, tags, imatges } = req.body;
    if (!nom || !url) {
      return res.status(400).json({ error: 'Nom i url són obligatoris' });
    }
    try {
      const newBio = new Bio({
        nom,
        url,
        tags: tags || [],
        autor: {
          nom: req.user.nom,
          cognoms: req.user.cognoms,
          email: req.user.email,
        },
        imatges: imatges || []
      });
      await newBio.save();
      res.json({ message: 'Bio creada correctament', bio: newBio });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  updateBio: async (req, res) => {
    const bioId = req.params.id;
    const { nom, url, tags, imatges } = req.body;
    try {
      const bio = await Bio.findById(bioId);
      if (!bio) {
        return res.status(404).json({ error: 'Bio no trobada' });
      }
      if (bio.autor.email !== req.user.email) {
        return res.status(403).json({ error: 'No tens permís per editar aquesta bio' });
      }
      bio.nom = nom || bio.nom;
      bio.url = url || bio.url;
      bio.tags = tags || bio.tags;
      bio.imatges = imatges || bio.imatges;
      await bio.save();
      res.json({ message: 'Bio actualitzada correctament', bio });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  deleteBio: async (req, res) => {
    const bioId = req.params.id;
    try {
      const bio = await Bio.findById(bioId);
      if (!bio) {
        return res.status(404).json({ error: 'Bio no trobada' });
      }
      if (bio.autor.email !== req.user.email) {
        return res.status(403).json({ error: 'No tens permís per esborrar aquesta bio' });
      }
      await Bio.findByIdAndDelete(bioId);
      res.json({ message: 'Bio esborrada correctament' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  get: async (req, res) => {
    const bioId = req.params.id;
    console.log(req.params)
    try {
      const bio = await Bio.findById(bioId);
      if (!bio) {
        return res.status(404).json({ error: 'Bio no trobada' });
      }
      res.json(bio);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  list: async (req, res) => {
    try {
      const searchQuery = req.query.search || "";
      let filter = {};
      let sortOption = {};
  
      if (searchQuery.trim() !== "") {
        filter = {
          $or: [
            { nom: { $regex: searchQuery, $options: "i" } },
            { url: { $regex: searchQuery, $options: "i" } },
            { tags: { $regex: searchQuery, $options: "i" } }
          ]
        };
      } else {
        sortOption = { updatedAt: -1 };
      }
  
      const bios = await Bio.find(filter).sort(sortOption);
      res.json(bios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error del servidor" });
    }
  }
};

module.exports = bioController;
