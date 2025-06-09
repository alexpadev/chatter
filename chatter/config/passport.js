const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs');
const session = require('express-session');
const mongoose = require('mongoose');
var MongoStore = require('connect-mongo');

// Load User model
const User = require('../models/Admin');

module.exports = function(app) {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
      // Match user
      const user = await User.findOne({email: email});
      if (!user) {
        return done(null, false, { message: 'That email is not registered' });
      }

      // Match password
      if(bcrypt.compareSync(password, user.contrasenya)){
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Express session
  app.use(session({
    secret:'secret',
    maxAge: new Date(Date.now() + 3600000),
    //store the session in the database
    store: MongoStore.create({client: mongoose.connection.getClient()})   
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
};