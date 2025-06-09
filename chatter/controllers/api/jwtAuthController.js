const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const Usuari = require('../../models/Usuari');
const bcrypt = require('bcrypt');

require('dotenv').config();

const debug = require('debug')('chatter:controllers:api.jwtAuthController');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_SENDER_ADDR,
    pass: process.env.MAIL_SENDER_PASSWORD
  }
});

const JWTAuthController = {
    login: async (req, res, next) => {
        if (!req.body.email || !req.body.contrasenya) {
            return res.status(400).json({
                message: 'Please enter email and password.'
            });
        }

        const email = req.body.email;
        const contrasenya = req.body.contrasenya;

        const user = await Usuari.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                message: 'Authentication failed. User not found.'
            });
        }

        if (user.checkPassword(contrasenya)) {
            debug("Login user: ", user.email);

            console.log('JWT_SECRET:', process.env.JWT_SECRET);


            // Es crea el token amb la informació de l'usuari
            const payload = {
                user_id: user.id,
                jwt_version: user.jwt_version
            };
            const jwt_token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2 days"
                
            });



            //usuari amb el token generat
            res.json({...user.toJSON(), jwt_token: jwt_token});
        } else {
            res.status(401).json({
                message: 'Authentication failed. Passwords did not match.'
            });


        }
    },

    changePassword: async (req, res) => {
        const user = await Usuari.findById(req.user.id);
        const { contrasenya, new_contrasenya } = req.body;
        if (!contrasenya || !new_contrasenya) {
            return res.status(400).json({
                message: 'Please enter current and new password.'
            });
        }

        if (!user.checkPassword(contrasenya)) {
            return res.status(401).json({
                message: 'Authentication failed. Passwords did not match.'
            });
        } else {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(new_contrasenya, salt);
            user.contrasenya = hash;
            const mailOptions = {
                from: process.env.MAIL_SENDER_ADDR,
                to: user.email,
                subject: 'Chatter password change',
                text: `The password for ${user.nom} has been changed.`
              };
              
              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
            await user.save();
            res.json({
                message: 'Password changed successfully.'
            });
        }
    
    },

    register: async (req, res, next) => {
      console.log(req.body);
      const { nom, cognoms, email, contrasenya, data_naixement, descripcio } = req.body;
      
      if (!email || !contrasenya || !nom || !cognoms || !data_naixement) {
          return res.status(400).json({
              success: false,
              message: 'Por favor, rellena todos los campos obligatorios.'
          });
      }
      
      const user = await Usuari.findOne({ email: email });
      if(user) {
          return res.status(400).json({
              success: false,
              message: 'Esa dirección de correo electrónico ya existe.'
          });
      }
      
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(contrasenya, salt);
      
      let newUser = new Usuari({
          nom,
          cognoms,
          email,
          contrasenya: hash,
          data_naixement,
          jwt_version: 0,
      });

      if (newUser) {
        const date = new Date();
        const mailOptions = {
          from: process.env.MAIL_SENDER_ADDR,
          to: newUser.email,
          subject: 'Chatter registration notification',
          text: `Welcome to Chatter, ${newUser.nom} on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}.`
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
      
      await newUser.save();
    

      const payload = {
        user_id: newUser.id,
        jwt_version: newUser.jwt_version
      };

      const jwt_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "2 days"
        
    });

    res.json({...newUser.toJSON(), jwt_token: jwt_token});

    
  },
   

  logout: async (req, res, next) => {
    debug("Logout user: ", req.user.email);
    req.user.jwt_version += 1;
    await req.user.save();

    if (req.app.locals.chat && req.user.email) {
      req.app.locals.chat.logoutUser(req.user.email);
    }

    res.json({ data: {} });
  }

}
module.exports = JWTAuthController;