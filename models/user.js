const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
   name:{
      type: 'string',
      required: true,
   },
   idBot: {
      type: 'number',
      required: true,
   },
   theme: {
      type: mongoose.Types.ObjectId,
      ref: "Theme",
   },
   answer: {
      type: 'string',
   }
}, {timestamps: true});


const User = mongoose.model('User', userSchema)

module.exports = User;