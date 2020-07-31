// required modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
// for logging
const toolbox = require('./private/toolbox');
const chalk = require('chalk');
const rowdy = require('rowdy-logger');

// app setup and middlewares
const app = express();
const rowdyResults = rowdy.begin(app);

// Bodyparser middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// private modules/middlwares
app.use(express.static(__dirname + '/private'));

// cors Middleware
app.use(cors());

// database setup af connection (options are to supress console warnings)
const mongooseOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex: true
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/innervuedb', mongooseOptions);

const db = mongoose.connection;

db.once('open', () => {
  console.log(chalk.black.bgGreen(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`));
});

db.on('error', (error) => {
  toolbox.logError('in server.js', 'db.on()', error);
});

// test route
app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
});

// Passport Middleware
app.use(passport.initialize());

// Passport JWT Config
require('./config/passport')(passport);

// route controllers
app.use('/users', require('./controllers/users'));

// check for enviromenmtal variable errors
toolbox.envError();

// initialize app on port
const port = process.env.PORT || 3001;

app.listen(port, () => {
  rowdyResults.print();
  console.log(chalk.black.bgYellow(` ~~~listening on port: ${port}~~~ `)); 
});
