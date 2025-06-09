// models/Usuari.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuariSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    cognoms: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    contrasenya: {
        type: String,
        required: true
    },
    data_naixement: {
        type: Date,
        required: true
    },
    descripcio: {
        type: String,
        required: false,
        trim: true
    },
    idiomes: {
        type: Array,
        required: false
    },
    avatar: {
        type: Buffer,
        required: false
    },
    jwt_version: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

UsuariSchema.index({
  nom: 'text',
  cognoms: 'text',
  email: 'text',
  descripcio: 'text'
});

UsuariSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, options) => {
      delete ret.__v;
      delete ret.contrasenya;
      delete ret.jwt_version;

      //id
      ret.id = ret._id.toString();
      delete ret._id;

      //avatar
      if (ret.avatar) {
        const b = Buffer.from(ret.avatar);
        ret.avatar = b.toString('base64');
      }
  },
});

UsuariSchema.methods.checkPassword = function(una_contrasenya) {
  return bcrypt.compareSync(una_contrasenya, this.contrasenya)
};

UsuariSchema.methods.getAvatarBase64 = function() {
    if (this.avatar) {
        return this.avatar.toString('base64');
    }
    return null;
};

module.exports = mongoose.model('Usuari', UsuariSchema);
