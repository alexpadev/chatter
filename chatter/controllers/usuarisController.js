var debug = require('debug')('chatter:controllers:usuarisController');
const Usuari = require('../models/Usuari');
const User = require('../models/Admin');
const bcrypt = require('bcryptjs');

const UsuarisController = {
  listUsers: async (req, res, next) => {
    try {
      const perPage = 4;
      const page = Math.max(0, parseInt(req.query.page) || 0);

      const usuaris = await Usuari.find()
        .limit(perPage)
        .skip(perPage * page)
        .sort({ nom: 'asc' });

      const count = await Usuari.countDocuments();
      const totalPages = Math.ceil(count / perPage);

      // Calcular las páginas a mostrar
      let pagesToShow = [];
      if (totalPages <= 3) {
        pagesToShow = Array.from({ length: totalPages }, (_, i) => i);
      } else {
        let start = page - 1;
        let end = page + 1;
        if (start < 0) {
          start = 0;
          end = 2;
        } else if (end >= totalPages) {
          end = totalPages - 1;
          start = end - 2;
        }
        pagesToShow = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }

      usuaris.forEach(usuari => {
        usuari.avatarReal = usuari.getAvatarBase64();
      });
  
      res.render('rud/listUsuari', { 
        usuaris,
        page,
        totalPages,
        pagesToShow // Pasar el array a la plantilla
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving users');
    }
  },

  viewUser: async (req, res, next) => {
    try {
      const usuari = await Usuari.findById(req.params.id);
      if (!usuari) {
        return res.status(404).send('User not found');
      }
      usuari.avatarReal = usuari.getAvatarBase64();
      res.render('rud/viewUsuari', { usuari });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving user');
    }
  },

  showUpdateForm: async (req, res, next) => {
    try {
      const usuari = await Usuari.findById(req.params.id);
      if (!usuari) {
        return res.status(404).send('User not found');
      }
      usuari.avatarReal = usuari.getAvatarBase64();
      res.render('rud/updateUsuari', { usuari });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Cannot update users right now');
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await Usuari.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      const { nom, cognoms, contrasenya, data_naixement, descripcio, idiomes, removeAvatar } = req.body;
      
      user.nom = nom || user.nom;
      user.cognoms = cognoms || user.cognoms;
      user.contrasenya = contrasenya || user.contrasenya;
      user.data_naixement = data_naixement || user.data_naixement;
      user.descripcio = descripcio || user.descripcio;
      user.idiomes = idiomes ? idiomes.trim().split(",").map(idioma => idioma.trim()) : user.idiomes;
  
      if (req.files && req.files.avatar) {
        user.avatar = req.files.avatar.data;
      }
  
      if (removeAvatar === "on") {
        user.avatar = null;
      }
  
      await user.save();
      req.flash('success', 'The user has been updated.');
      res.redirect("/users/list");
    } catch (err) {
      console.error(err.message);
      req.flash('error', 'There has been an error while updating the user.');
      res.status(500).send("Cannot update user");
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const usuari_id = req.params.id;
      await Usuari.deleteOne({ _id: usuari_id });
      req.flash('success', 'The user has been deleted.');
      res.redirect("/users/list");
    } catch (err) {
      console.error(err.message);
      req.flash('error', 'There has been an error while deleting the user.');
      res.status(500).send("Cannot delete user right now");
    }
  },

  listAdmins: async (req, res, next) => {
    debug("chatter:usuaris:log");
    res.send("TODO: llistat d'usuaris (admins)");
  },

  getRegisterForm: (req, res, next) => {
    res.render('register');
  },

  registerUser: async (req, res, next) => {
    try {
      const { name, email, password, password2 } = req.body;
      let errors = false;
  
      if (!name || !email || !password || !password2) {
        req.flash('error_msg', 'Please enter all fields');
        errors = true;
      }
  
      if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match');
        errors = true;
      }
  
      if (password.length < 6) {
        req.flash('error_msg', 'Password must be at least 6 characters');
        errors = true;
      }
  
      if (errors) {
        return res.render('register', {
          name,
          email,
          password,
          password2
        });
      }
  
      const user = await User.findOne({ email: email });
      if (user) {
        req.flash('error_msg', 'Email already exists');
        return res.render('register', {
          name,
          email,
          password,
          password2
        });
      }
  
      const newUser = new User({
        name,
        email,
        password
      });
  
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
  
      newUser.password = hash;
      await newUser.save();
      
      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/users/login');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = UsuarisController;
