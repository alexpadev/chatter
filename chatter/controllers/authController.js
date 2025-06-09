const passport = require('passport');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_SENDER_ADDR,
    pass: process.env.MAIL_SENDER_PASSWORD
  }
});

const AuthController = {
  login: (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('error', 'Invalid username or password.');
        return res.redirect('/auth/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        Admin.findOne({ email: user.email })
          .then(adminRecord => {
            if (adminRecord) {
              const message = {
                from: process.env.MAIL_SENDER_ADDR,
                to: adminRecord.email,
                subject: 'Admin Login Notification',
                html: `<p>Admin ${user.email} logged in at ${new Date().toLocaleString()}.</p>`
              };
              transporter.sendMail(message)
                .then(info => {
                  console.log('Admin login email sent:', info.messageId);
                })
                .catch(err => {
                  console.error('Error sending admin email:', err);
                });
            }
          })
          .catch(err => {
            console.error('Error checking admin status:', err);
          });
        req.flash('success', 'Welcome back!');
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  },

  logout: (req, res, next) => {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', 'You have been logged out.');
      res.redirect('/auth/login');
    });
  },
  

  changePassword: (req, res, next) => {
    res.render('auth/password'); 
  },

  updatePassword: async (req, res, next) => {
    if (!req.user) {
      req.flash('error', 'You must be logged in to change your password.');
      return res.redirect('/auth/login');
    }

    const { oldPassword, confirmOldPassword, newPassword, confirmNewPassword } = req.body;

    if (oldPassword !== confirmOldPassword) {
      req.flash('error', 'Old passwords do not match.');
      return res.redirect('/auth/password');
    }

    if (newPassword !== confirmNewPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/auth/password');
    }

    if (newPassword.length < 8) {
      req.flash('error', 'New password must be at least 8 characters long.');
      return res.redirect('/auth/password');
    }

    if (!bcrypt.compareSync(oldPassword, req.user.contrasenya)) {
      req.flash('error', 'Old password is incorrect.');
      return res.redirect('/auth/password');
    }

    try {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      await Admin.findByIdAndUpdate(req.user._id, { contrasenya: hashedPassword });

      const message = {
        from: process.env.MAIL_SENDER_ADDR,
        to: req.user.email,
        subject: 'Password Change Confirmation',
        html: `<p>Hello,</p>
               <p>Your password has been successfully changed on ${new Date().toLocaleString()}.</p>
               <p>If you did not initiate this change, please contact support immediately.</p>`
      };

      transporter.sendMail(message)
        .then(info => {
          console.log('Password change confirmation email sent:', info.messageId);
        })
        .catch(err => {
          console.error('Error sending confirmation email:', err);
        });

      req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Password changed successfully. Please log in again.');
        return res.redirect('/auth/login');
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;
