const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: false,
    },
    cognoms: {
        type: String,
        required: true,
        unique: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    _id: false 
});

const BioSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: false,
        trim: true
    },
    url: {
        type: String,
        required: true,
        unique: false,
        trim: true
    },
    autor: {
        type: AuthorSchema,
        required: true
    },
    tags: {
        type: Array,
        required: false
    },
    imatges: {
        type: Array,
        required: false
    }
}, {
    timestamps: true
});

BioSchema.index({ nom: 'text', url: 'text', tags: 'text' });

BioSchema.methods.getImatgesBase64 = function() {
    if (this.imatges && this.imatges.length > 0) {
        return this.imatges.map(x => x.toString('base64'));
    }
    return null;
};

module.exports = mongoose.model('Bio', BioSchema);
