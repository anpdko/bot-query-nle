const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const themeSchema = new Schema({
   theme:{
      type: 'string',
      required: true,
   },
}, {timestamps: true});


const Theme = mongoose.model('Theme', themeSchema)

module.exports = Theme;