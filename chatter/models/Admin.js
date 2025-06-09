const mongoose = require('mongoose');


const AdminSchema = new mongoose.Schema({
 email: {
   type: String,
   required: true,
   unique: true,
   lowercase: true,
   trim: true
 },
 contrasenya: {
   type: String,
   required: true
 }
}, {
 timestamps: true
});


module.exports = mongoose.model('Admin', AdminSchema);