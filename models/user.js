const mongoose = require('mongoose');

// answered questions embedded document
const answeredQuestionSchema = new mongoose.Schema({
  category: String,
  content: String,
  answer: String,
  analysis: {
    negativeMentions: Array,
    overallScore: String,
    overallMagnitude: String,
    overallFeedback: String
  }
}, {
  timestamps: true
})

// user collection
const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100
    },
    lastName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true
    }, 
    password: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100
    },
    answeredQuestions: [answeredQuestionSchema],
  }, {
  timestamps: true
  }
);

// return a user's full name
userSchema.methods.getFullName = function(){
  return `${this.firstName} ${this.lastName}`
}

let User = mongoose.model('User', userSchema);

module.exports = User;