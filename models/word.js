const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const wordSchema = new Schema({
   theme:{
      type: mongoose.Types.ObjectId,
      ref: "Theme",
      required: true,
   },
   word_ru: {
      type: 'string',
      required: true,
   },
   word_en: {
      type: 'string',
      required: true,
   },
}, {timestamps: true});


const Word = mongoose.model('Word', wordSchema)

module.exports = Word;