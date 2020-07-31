// run this script from the console with node testDb.js to test CRUD functionality

// load user model
const User = require('./models/User');
const toolbox = require('./private/toolbox');
const mongoose = require('mongoose');
const chalk = require('chalk');

// database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/innervuedb');

const db = mongoose.connection;

db.once('open', () => {
  console.log(chalk.black.bgGreen(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`));
});

db.on('error', (error) => {
  toolbox.logError('in server.js', 'db.on()', error);
});

// User.find({}, function(err, users) {
//   console.log('test')
//   if (err) return toolbox.logError(err);
//   toolbar.log(users)
// });

// const newUser = new User ({
//   firstName: 'Weston',
//   lastName: 'Bailey',
//   email: 'test1@test.com', 
//   password: '12345678'
// })


// creating a user with questions

User.create({
  firstName: 'Weston',
  lastName: 'Bailey',
  email: 'test4@test.com',
  password: '12345678'
  }, (err, user) => {
    if (err) return toolbox.logError(err);
    user.answeredQuestions.push({
      category: 'test category',
      content: 'test content',
      answer: 'test answer',
      analysis: {
        key1: 'test key1',
        key2: 'test key2'
      }
    })
    toolbox.log(user)
    user.save(error => {  if (error) return toolbox.logError(error) })
})

// Find All

// User.find({}, function(error, users) {
//   if (error) return toolbox.logError(error);
//   users.forEach(user => {
//     let questions;
//     toolbox.log(user, user.answeredQuestions);
//   })
//   // toolbox.log(users)
// });

// find one

// User.findOne({ email: 'test4@test.com' }, (error, user) => {
//   if (error) return toolbox.logError(error);
//   toolbox.log(user, user.answeredQuestions);
// })

// find one that doesn't exist

User.findOne({ email: ' ' }, (error, user) => {
  if (error) return toolbox.logError(error);
  if(user){
    toolbox.log(user, user.answeredQuestions);
  } else {
    toolbox.log('no user found!')
  }
})

// find one and add a question

User.findOne({ email: 'test4@test.com' }, (error, user) => {
  if (error) return toolbox.logError(error);
  toolbox.log(user, user.answeredQuestions);
  user.answeredQuestions.push({
    category: 'test category 2',
    content: 'test content 2',
    analysis: {
      key1: 'test key1',
      key2: 'test key2'
    }
  })
  user.save(error => { if (error) return toolbox.logError(error) })
  toolbox.log('Saved User', user, user.answeredQuestions);

})

const newQuestion = {

}

