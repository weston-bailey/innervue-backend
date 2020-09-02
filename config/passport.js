require('dotenv').config();
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const chalk = require('chalk');
const toolbox = require('../private/toolbox');

const options= {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;

module.exports = passport => {
  // return if no jwt secret is found to prevent crash
  if(!process.env.JWT_SECRET){
    return 
  }

  passport.use(new JwtStrategy(options, (jwt_payload, done) => {
    // find User Model
    User.findById(jwt_payload.id)
      .then(user => {
        if(user) {
          // If user is found, return null (for error) and user
          return done(null, user);
        }
        // If no user is found
        return done(null, false);
      })
      .catch(error => {
        toolbox.logError('/config/passport.js', 'module.exports', 'User.findById()', error);
      });
  }));
};


