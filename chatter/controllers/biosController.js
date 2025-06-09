var debug = require('debug')('chatter:controllers:usuarisController');
const Bio = require('../models/Bio');
const bcrypt = require('bcryptjs');

const BiosController = {
  listBios: async (req, res, next) => {
    try {
      const perPage = 4;
      const page = Math.max(0, parseInt(req.query.page) || 0);

      const bios = await Bio.find()
      .limit(perPage)
      .skip(perPage * page)
      .sort({ nom: 'asc' });

    const count = await Bio.countDocuments();
    const totalPages = Math.ceil(count / perPage);
      bios.forEach(bio => {
        bio.imatgesReal = bio.getImatgesBase64();
      });
  
      res.render('bio/list', { 
        bios,
        page,
        totalPages
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving bios');
    }
  },

  viewBios: async (req, res, next) => {
    try {
      const bio = await Bio.findById(req.params.id);
      if (!bio) {
        return res.status(404).send('Bio not found');
      }
      bio.imatgesReal = bio.getImatgesBase64();
      res.render('bio/read', { bio });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving user');
    }
  },

  showUpdateForm: async (req, res, next) => {
    try {
      const bio = await Bio.findById(req.params.id);
      if (!bio) {
        return res.status(404).send('User not found');
      }
      bio.imatgesReal = bio.getImatgesBase64();
      res.render('bio/update', { bio });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Cannot update bios right now');
    }
  },

  updateBios: async (req, res, next) => {
    try {
      const bioID = req.params.id;
      const bio = await Bio.findById(bioID);
      if (!bio) {
        return res.status(404).send("No s'ha trobat la bio");
      }
      
      const { nom, url, tags, removeImatges } = req.body;
      
      bio.nom = nom || bio.nom;
      bio.url = url || bio.url;
      
      if (typeof tags === 'string') {
        bio.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      }
      
      if (removeImatges) {
        let indicesToRemove = (removeImatges)
          ? removeImatges
          : [removeImatges];
        indicesToRemove = indicesToRemove.map(index => parseInt(index, 10));
        bio.imatges = bio.imatges.filter((imatge, index) => !indicesToRemove.includes(index));
      }
      
      await bio.save();
      req.flash('success', 'La bio s\'ha actualitzat correctament.');
      res.redirect("/bios/list");
    } catch (err) {
      console.error(err.message);
      req.flash('error', 'S\'ha produït un error en actualitzar la bio.');
      res.status(500).send("No es pot actualitzar la bio");
    }
  },
  
  
  

  deleteBios: async (req, res, next) => {
    try {
      const bioID = req.params.id;
      await Bio.deleteOne({ _id: bioID });
      req.flash('success', 'The bio has been deleted.');
      res.redirect("/bios/list");
    } catch (err) {
      console.error(err.message);
      req.flash('error', 'There has been an error while deleting the bio.');
      res.status(500).send("Cannot delete bio right now");
    }
  },
};

module.exports = BiosController;
