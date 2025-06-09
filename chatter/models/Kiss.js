const mongoose = require('mongoose');

const KissSchema = new mongoose.Schema({
  fromEmail: {
    type: String,
    required: true,
  },
  // Permet fer kiss directament a un usuari
  targetEmail: {
    type: String,
    required: function() {
      return !this.targetBio;
    }
  },
  // O bé a un registre de bio
  targetBio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bio',
    required: function() {
      return !this.targetEmail;
    }
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Kiss', KissSchema);
