const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/user');
const Theme = require('./models/theme');
const Word = require('./models/word');
require('dotenv').config();


const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true }, 200);

// const options = {
//    webHook: {
//        port: process.env.PORT
//    }
// };
// const bot = new TelegramBot(process.env.BOT_TOKEN, options);


// var port = 8443,
//     host = '0.0.0.0',
//     externalUrl = process.env.HEROKU_URL,
//     token = process.env.BOT_TOKEN,
//     bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: { port : port, host : host } });
// bot.setWebHook(externalUrl + ':'+port+'/bot' + token);

const db = 'mongodb+srv://admin:0987864021@cluster0.r7kee.mongodb.net/nle?retryWrites=true&w=majority'
mongoose.connect(db, {
      useNewUrlParser: true, 
      useUnifiedTopology: true})
   .then((res) => console.log("Connected!"))
   .catch((err) => console.log(err))


//Кнопки для меню выбора тем
function keyThemes(chatId){
   Theme.find()
      .then((result) => {
         const keyboard = [];
         for(obj of result){
            keyboard.push([{
               text: '▫ ' + obj.theme,
               callback_data: obj._id
            }]);
         }
         bot.sendMessage(chatId, '✳️ Выберите тему урока, чтобы \nпроверить свои знания:', {
            reply_markup: {
              inline_keyboard: keyboard
            }
         });
      })
      .catch((err) => console.log(err))
}

//Разположение кнопок
function keyWords(words){
   switch(words.length) {
      case 1:
         return [["⬅️",words[0].word_ru]];
      case 2:
         return [
            ["⬅️"],
            [words[0].word_ru,  words[1].word_ru]];
      case 3:
         return [
            ["⬅️", words[0].word_ru],
            [words[1].word_ru, words[2].word_ru]];
      case 4:
         return [
            ["⬅️ Все темы"], [words[0].word_ru,  words[1].word_ru],
            [words[2].word_ru, words[3].word_ru]];
      case 5:
         return [
            ["⬅️ Все темы"], [words[0].word_ru,  words[1].word_ru],
            [words[2].word_ru, words[3].word_ru, words[4].word_ru]];
      case 6:
         return [
            ["⬅️ Все темы"], [words[0].word_ru,  words[1].word_ru],
            [words[2].word_ru, words[3].word_ru],
            [words[4].word_ru, words[5].word_ru]];
   }
}

//Доп. функции рандома 
function getRandom(arr, n) {
   var result = new Array(n),
       len = arr.length,
       taken = new Array(len);
   if (n > len)
       throw new RangeError("getRandom: more elements taken than available");
   while (n--) {
       var x = Math.floor(Math.random() * len);
       result[n] = arr[x in taken ? taken[x] : x];
       taken[x] = --len in taken ? taken[len] : len;
   }
   return result;
}

//Генирация выбора
function setAnswer(chatId){
   User.findOne({idBot: chatId})
      .then((result) => {
         //найти слова выбраной темы
         Word.find({theme: result.theme})
            .then((wordTest) => {
               //Убрать лишние слова и перемешать
               if(wordTest.length > 4)
                  wordTest = getRandom(wordTest, 4)
               else
                  wordTest = wordTest.slice(0, wordTest.length);

               //Рандомный ответ
               let rund = Math.floor(Math.random()* wordTest.length)

               User.updateOne({idBot: chatId}, {answer: wordTest[rund].word_ru})
                  .then((result) => console.log("Ответ: " + wordTest[rund].word_ru))
                  .catch((err) => console.log(err))

               bot.sendMessage(chatId, "Выберите перевод: \n<b>" + wordTest[rund].word_en + "</b>", {
                  parse_mode: 'HTML',
                  reply_markup: {
                     keyboard: keyWords(wordTest)
                  }
               });
            })
            .catch((err) => console.log(err))
      })
      .catch((err) => {
         //console.log(err);
         bot.sendMessage(chatId, "Ошибка! Пользователь не зарегистрирован! Отправте команду /start");
      })
}


// Проверка отправленого сообщения
bot.on('message', msg => {
   const chatId = msg.chat.id;
   if(msg.text === '/start'){
      //Регистрация нового пользователя
      User.findOne({idBot: chatId})
         .then((result) => {
            if(result == null){
               const user = new User({
                  name: msg.from.first_name,
                  idBot: msg.from.id, 
               })
               user.save()
                  .then((result) => {
                     bot.sendMessage(chatId, "▶️ <b>Зарегистрирован!</b> \nТут должна быть инструкция!",{parse_mode: 'HTML'});
                  })
                  .catch((err) => console.log(err))
            }
         })


         .catch((err) => console.log(err))
      keyThemes(chatId);
   }
   else if(msg.text === '⬅️' || msg.text === "⬅️ Все темы"){
      keyThemes(chatId);
   }
   else{
      //Проверка правильного ответа. генерация нового вопроса
      User.findOne({idBot: chatId})
         .then((result) => {
            if(result == null){
               bot.sendMessage(chatId, "Ошибка! Пользователь не зарегистрирован! Отправте команду /start");
            }
            else if(msg.text == result.answer){
               bot.sendMessage(chatId, '✅ Правильно!');
               setTimeout(() => setAnswer(chatId), 100);
            }
            else{
               bot.sendMessage(chatId, '❌ Неправильно! \nПопробуй еще раз!');
            }
         })
         .catch((err) => console.log(err))
   }
   
})
   

//Проверка нажатия клавиатуры
bot.on('callback_query', (query) => {
   const chatId = query.message.chat.id;
   Theme.findById(query.data)
      .then((result) => {
         bot.sendMessage(chatId, "Выбраная тема: " + result.theme);
         //Обновление темы пользователя
         User.updateOne({idBot: chatId}, {theme: result._id})
            .then(() => {
               console.log("Тема: " + result.theme)
               setAnswer(chatId);
            })
            .catch((err) => console.log(err))
      })
      .catch((err) => console.log(err))
})



const express = require('express')
const app = express()
const port = process.env.PORT  || 3000 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})