require('dotenv').config();
const express = require('express');
const router = express.Router();
const toolbox = require('../private/toolbox');
const msgService = require('../private/msgService');
// Imports the Google Cloud client library
const language = require(`@google-cloud/language`);
const beautify = require("json-beautify");
// Imports IBM watson tone analyzer
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');
// for auth
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
// load mongoDB user model
const User = require('../models/User');

// test route
router.get('/', (req, res) => {
  return res.json(msgService.test());
});

// get user's answered questions from database
router.get('/:userId/questions', (req, res) => {
  let userId = req.params.userId;
  
  User.findOne({ _id: userId }, (error, user) => {
    if (error) {
      toolbox.logError('users.js', 'POST /:userId/questions', 'User.findOne()', error)
      // send status 500 and a message user not found
      return res.status(500).json(msgService.internalError(error));
    }
    if(!user){
      // send status 200 and user not found message
      return res.status(200).json(msgService.resourceNotFound());
    }
    // send user's answred questions to client
    res.status(201).json(user.answeredQuestions);
  })
});

// contact sentiment APIs and add answered question to user
router.post('/:userId/questions', (req, res) => {
  // URL query string
  let userId = req.params.userId;
  // question, user's answer and category
  let question = req.body

  // we don't want blank values in the question, return immediately if they are found
  if(!question.answer) return res.json(msgService.responseTooShort());

  if(!question.content || !question.category) return res.json(msgService.noQuestion());

  User.findOne({ _id: userId }, (error, user) => {
    if (error) {
        toolbox.logError('users.js', 'POST /:userId/questions', 'User.findOne()', error)
        // TODO send error status to client
        return res.status(500).json(msgService.internalError(error));
    }

    if(!user){
      // send status 200 and user not found message
      return res.status(200).json(msgService.resourceNotFound());
    }

    // perfrom call APIs, perform analysis on user's answer
    (async text => {
      // Instantiates a google langauge client
      const client = new language.LanguageServiceClient();

      // Instantiates an IBM Watson tone analyzer
      const toneAnalyzer = new ToneAnalyzerV3({
        // See: https://github.com/watson-developer-cloud/node-sdk#authentication
        version: '2017-09-21',
      });

      // format user's answer into a google langauge document
      const document = {
        content: text,
        type: `PLAIN_TEXT`,
      };

      // hit the google APIs at same time, don't proceed until all have responded
      const [analyzeSentiment, analyzeEntitySentiment] = await Promise.all([
        client.analyzeSentiment({document: document}),
        client.analyzeEntitySentiment({document: document}),
      ]);

      // Array of 'utterances' to send to IBM watson 
      let utterances = []

      // pull each sentence out of the analyzeSentiment response from Google
      analyzeSentiment[0].sentences.forEach(sentence => {
        let textContent = sentence.text.content;
        // format utterances for IBM watson
        utterances.push({ text: textContent, user: 'user' });
      });

      // Contact IBM watson
      toneAnalyzer.toneChat({utterances: utterances})
      .then(response => {
          // load up an object with data from the APIs
          let payload = {
            analyzeSentiment,
            analyzeEntitySentiment,
            analyzeTone: response.result
          }

          // uncomment these lines to explore that beautiful blob of data in the console
          // print = beautify(payload, null, 2, 10);
          // console.log(print)

          // return if the answer was too short
          if(payload.analyzeTone.utterances_tone.length < 4) return res.json(msgService.responseTooShort());

          // format analysis based on sentiment 
          let analysis = {}
          analysis.negativeMentions = []

          // search for any entities that have negative sentiment associated with them
          payload.analyzeEntitySentiment[0].entities.forEach(mention => {
            if(mention.sentiment.score < 0){
              analysis.negativeMentions.push(mention.name);
            }
          });

          //Overall sentiment of users's answer
          let score = payload.analyzeSentiment[0].documentSentiment.score;
          analysis.overallScore = (score < -.5 ? "negative" :
                                   score < .5 ? "neutral" :
                                   "positve");

          let magnitude = payload.analyzeSentiment[0].documentSentiment.magnitude;
          analysis.overallMagnitude = (magnitude < 1 ? "somewhat" :
                                       magnitude < 2 ? "moderately" :
                                       magnitude < 3 ? "clearly" :
                                       "extremely"); 

          // provide some feedback based on overall sentiment score
          switch(analysis.overallScore){
            case "negative" :
              analysis.overallFeedback = "Your response reflects a negative sentiment. We suggest modifying your response to communicate more effectively.";
              break;
            case "neutral" :
              analysis.overallFeedback = "Your response is looking good, try modifying it some more to make it more impactful.";
              break;
              case "positve" :
                analysis.overallFeedback = "Your response reflects a clearly positive sentiment. This will appeal to interviewers!";
              break;
            default :
              analysis.overallFeedback = "Oh no! something went wrong! 😕"
          }

          // mount tones on analysis if found
          analysis.utterancesTones = [];

          // get tones for each utterance (sentance)
          payload.analyzeTone.utterances_tone.forEach(utterance => {
            // only look if tones are present
            if(utterance.tones.length > 0){
              // there can be many tones per utterance
              utterance.tones.forEach(tone => {
                // only push unique tones to analysis
                if(!analysis.utterancesTones.includes(tone.tone_id)) analysis.utterancesTones.push(tone.tone_id);
              })
            }
          });

          //mount analysis on question object
          question.analysis = analysis;

          // push question to user's embedded question document
          user.answeredQuestions.push(question);
          
          // save user in database
          user.save((error, user) => {
            if (error) { 
              toolbox.logError('users.js', 'POST /:userId/questions', 'user.save()', error);
              // TODO send error status to client
              return res.status(500).json(msgService.internalError(error));
            }
            // respond to client with newly created question form the database
            res.status(201).json(user.answeredQuestions[user.answeredQuestions.length - 1])
            // res.status(201).json(question)
          })
        })
        .catch(error => console.error(error));
    })(question.answer);
  })
});

router.delete('/:userId/questions/:questionId', (req, res) => {
  let userId = req.params.userId;
  let questionId = req.params.questionId;

  User.findOne({ _id: userId }, (error, user) => {
    if (error) {
      toolbox.logError('users.js', 'DEL /:userId/questions/:questionId', 'User.findOne()', error)
      // send status 500 and a message user not found
      return res.status(500).json(msgService.internalError(error));
    }

    if(!user) return res.status(200).json(msgService.alert());
    
    // dont try to crud unless the question exists exists 
    // TODO refactor error handling
    if(user.answeredQuestions.id(questionId)){
      user.answeredQuestions.id(questionId).remove( () => {
        // save user after removal
        user.save((error, user) => {
          if (error) { 
            toolbox.logError('users.js', 'POST /:userId/questions', 'user.save()', error);
            // TODO send error status to client
            return res.status(500).json(msgService.internalError(error));  
          }
        // send user's answred questions to client
        res.status(201).json(user.answeredQuestions);
        });
      });
    } else {
      // respond that the question doesn't exist
      return res.status(200).json(msgService.resourceNotFound());
    }
  })
})

// AUTH ROUTES TODO: refactor controllers

// do login auth and log user in
router.post('/auth/login', (req, res) => {
  // data from request body
  let email = req.body.email;
  let password = req.body.password;

  // validate fields
  if(password.length == 0 || email.length == 0) return res.status(200).json(msgService.alert('Please enter all fields.'));
  
  // reject bad emails
  if(!email.match(/[\w-]+@([\w-]+\.)+[\w-]+/)) return res.status(200).json(msgService.alert('Please enter a valid email.'));
  
  User.findOne({ email }, (error, user) => {
    if (error) {
      toolbox.logError('users.js', 'POST /login', 'User.findOne()', error)
      // send status 500 todo server error
      return res.status(500).json(msgService.internalError(error));
    }
    // here
    if(!user) return res.status(200).json(msgService.alert('Password or email is incorrect.'));

    // bcrypt compare passwords
    bcrypt.compare(password, user.password)
    .then(isMatch => {
      if(isMatch) {
        // if passwords match, create and send JSON Web Token
        const payload = { 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          fullName: user.getFullName(),
          // answeredQuestions: user.answeredQuestions 
        }

        // Sign token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
          if (error) {
            toolbox.logError('users.js', 'POST /login', 'jwt.sign()', error);
            // send status 500 server error
            return res.status(500).json(msgService.internalError(error));
          }
          // send status 201 if sign in successful
          return res.status(201).json({ success: true, token: 'Bearer ' + token })
        });
      } else {
        // send status 200 if password is incorrect
        return res.status(200).json(msgService.alert('Password or email is incorrect.'));
      }
    })
  })
});

// do registration auth and create a new user
router.post('/auth/register', (req, res) => {
  // data from request body (all are required to write to the database)
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;

  // validate fields
  if(firstName.length == 0 || lastName.length == 0 || email.length == 0) return res.status(200).json(msgService.alert('Please enter all fields.'));

  // reject bad emails
  if(!email.match(/[\w-]+@([\w-]+\.)+[\w-]+/)) return res.status(200).json(msgService.alert('Please enter a valid email.'));

  // minimum password length
  if(password.length < 8) return res.status(200).json(msgService.alert('Passwords must have at least 8 characters.'));

  User.findOne({ email }, (error, user) => {
    if (error) {
      toolbox.logError('users.js', 'POST /register', 'User.findOne()', error);
      // TODO send error status to client
      return res.status(500).json(msgService.internalError(error));
    }

    if(user){
      return res.status(200).json(msgService.alert('Email already exists in database.'));
    } else {
      // if user is not found create a new one
      // create new user
      let newUser = new User({
        firstName,
        lastName,
        email,
        password,
      })
      
      // Salt and Hash password with bcrypt-js, then save new user 
      bcrypt.genSalt(10, (error, salt) => {
        if (error) {
          toolbox.logError('users.js', 'POST /register', 'bcrypt,genSalt()', error)
          // send status 500 server error
          return res.status(500).json(msgService.internalError(error));
        }

        bcrypt.hash(newUser.password, salt, (error, hash) => {
          if (error) {
            toolbox.logError('users.js', 'POST /register', 'bcrypt.hash()', error)
            // send status 500 server error TODO
            return res.status(500).json(msgService.internalError(error));
          }

          newUser.password = hash;
          newUser.save((error, user) => {  
            if (error) { 
              // send status 500 server error TODO
              toolbox.logError('users.js', 'POST /register', 'newUser()', error) 
              return res.status(500).json(msgService.internalError(error));
            }

            // once new user is saved create and send JSON Web Token
            const payload = { 
              id: user.id, 
              firstName: user.firstName, 
              lastName: user.lastName, 
              fullName: user.getFullName(),
            }

            // Sign token
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
              if (error) {
                toolbox.logError('users.js', 'POST /login', 'jwt.sign()', error)
                // send status 500 server error
                return res.status(500).json(msgService.internalError(error));
              }
              // send status 201 if sign in successful
              return res.status(201).json({ success: true, token: 'Bearer ' + token })
            });
          })
        })
      })
    }
  })
});

// currently unused but could be useful for profile page stretch goal
router.get('/auth/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ 
    id: req.user.id, 
    firstName: req.user.firstName, 
    lastName: req.user.lastName, 
    fullName: req.user.getFullName(),
    answeredQuestions: req.user.answeredQuestions 
  });
});

module.exports = router;
