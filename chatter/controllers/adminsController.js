const debug = require('debug')('chatter:controllers:adminsController');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const AdminsController = {

  listAdmins: async (req, res, next) => {
    try {
      const admins = await Admin.find().sort({ email: 'asc' });
      res.render('admins/list', { admins });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving admins');
    }
  },

  getRegisterForm: (req, res, next) => {
    res.render('admins/create');
  },

  registerAdmin: async (req, res, next) => {
    try {
      const { email, emailConfirm, contrasenya, contrasenyaConfirm } = req.body;
      let errors = [];

      if (!email || !emailConfirm || !contrasenya || !contrasenyaConfirm) {
        errors.push('Please fill in all fields');
      }
      if (email !== emailConfirm) {
        errors.push('Emails do not match');
      }
      if (contrasenya !== contrasenyaConfirm) {
        errors.push('Passwords do not match');
      }
      if (contrasenya.length < 8) {
        errors.push('Password must be at least 8 characters');
      }

      if (errors.length > 0) {
        req.flash('error', errors.join('. '));
        return res.redirect('/admins/create');
      }

      const existingAdmin = await Admin.findOne({ email: email });
      if (existingAdmin) {
        req.flash('error', 'Email already exists');
        return res.redirect('/admins/create');
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(contrasenya, salt);

      const newAdmin = new Admin({
        email,
        contrasenya: hash
      });

      await newAdmin.save();
      req.flash('success', 'New admin has been created');
      res.redirect('/admins');
    } catch (err) {
      console.error(err);
      req.flash('error', 'There was an error creating the admin');
      res.status(500).send('Error creating admin');
    }
  },

  deleteAdmin: async (req, res, next) => {
    try {
      const adminId = req.params.id;
      
      if (req.user && req.user.id === adminId) {
        req.flash('error', "You cannot delete yourself");
        return res.redirect('/admins');
      }
      
      await Admin.deleteOne({ _id: adminId });
      req.flash('success', 'Admin has been deleted');
      res.redirect('/admins');
    } catch (err) {
      console.error(err);
      req.flash('error', 'There was an error deleting the admin');
      res.status(500).send('Error deleting admin');
    }
  }

};

module.exports = AdminsController;
