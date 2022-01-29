const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const AdminJSMongoose = require('@adminjs/mongoose')
const mongoose = require('mongoose')
const User = require('./models/user');
const Theme = require('./models/theme');
const Word = require('./models/word');
require('dotenv').config();

//котегория
const contentParent = {
   name: 'База данных'
 }

const adminJsOptions = {
   resources: [{ 
      resource: User, options: {
         parent: contentParent, 
         editProperties: ['name'],
         listProperties: ['name', 'idBot', 'theme', 'answer', 'createdAt', 'updatedAt']
      }},
      {resource: Theme, options: {
         parent: contentParent, 
         listProperties: ['theme', 'createdAt', 'updatedAt'],
         showProperties: ['theme', 'createdAt', 'updatedAt'],
      }},
      {resource: Word, options: {
         parent: contentParent,
         listProperties: ['word_ru', 'word_en', 'theme', 'createdAt', 'updatedAt'],
         showProperties: ['word_ru', 'word_en', 'theme', 'createdAt', 'updatedAt']
      }
   }],
   locale: {
      translations: {
        labels: {
         User: 'Пользователи',
         Theme: 'Темы',
         Word: 'Слова'
        }
      }
    },
    rootPath: '/admin'
 }

AdminJS.registerAdapter(AdminJSMongoose)

const db = process.env.BD

module.exports = {
   run: function(){
      mongoose.connect(db, {
         useNewUrlParser: true, 
         useUnifiedTopology: true})
      .then((res) => {
         const express = require('express')
         const app = express()
   
         const adminJs = new AdminJS(adminJsOptions)
   
         const router = AdminJSExpress.buildRouter(adminJs)
         app.use(adminJs.options.rootPath, router)
         app.listen(8080, () => console.log('AdminJS is running under localhost:8080/admin'))
      })
      .catch((err) => console.log(err))
   }
}