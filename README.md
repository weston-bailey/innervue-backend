# innervue

## Giving  job applicants the key tools to ace the interview

### Neri Ramirez 
* Product Manager
* Full-Stack Developer
* Scrum Master
* Pitch Deck

### Karly Smith
* Organization
* Research
* Wireframes
* Full-Stack Developer

### Weston Bailey
* GIT Master
* README
* ERD/Database Manager
* Full-Stack Developer

## MVP

[] user can login and respond to interview questions

[] user can choose from a variety of interview questions

[] user can respond with speech or writing 

[] user is given feedback on their response to interview questions 

[] user can view responses to questions that are saved in the database from the past

[] user can revisit past question to try them again

## Stretch Goals

[] job tips using [muse](https://www.themuse.com/developers/api/v2) API (side bar with taglines, user can save links to database)

[] Calendar function allows user to enter interview milestones

[] Data visualization of answered questions and job searches with d3 

## Project Resources

#### Miro Boards

WireFrames, Daily Sprints, EBD

[Miro](https://miro.com/app/board/o9J_ko3gZmQ=/)

#### Pitch Deck

[deck](https://docs.google.com/presentation/d/1OtWFGOcKu8Px85JDC-xJeiwRxAOn1UNitU407e54-y4/edit#slide=id.ge9090756a_1_78)

> ### Naming conventions
> *

> ### Project Folder Organization
> ```
> .
> ├── src
> │   ├── file11.ext
> │   └── file12.ext
> ├── dir2
> │   ├── file21.ext
> │   ├── file22.ext
> │   └── file23.ext
> ├── dir3
> ├── file_in_root.ext
> └── README.md
> ```
# Agree on technologies to use

> ### possible sentiment analysis APIs
> * sentim.ai >> easy to work with
> * cloud natural language
> * npm sentiment

> ### HTTP requests
> * axios
> * fetch

> ### style/css technology 
> * material ui [link](https://material-ui.com/getting-started/installation/)
> * materialize
> * bootstrap

> ### Node packages
> * material ui [link](https://www.npmjs.com/package/@material-ui/core)
> * speech recognition 

# Plan routes

> ## React routes
> HTTP Path | Component | Auth Required
> ----------|-----------|--------------|
> / | |
>  /login | |
> 

> ## API routes (express)
> HTTP Verb | Route | Request | Response | Auth Required
> ----------|-------|---------|----------|--------------|
> GET | /api/v1/:userId | request params | validate user | yes
> POST | /api/v1/:userId |  |  |
> GET | /api/v1/:userId/question | |  |
> PUT | /api/v1/:userId/question  | |  |
> POST | /api/v1/:userId/question | |  |



# Plan React Component Tree based on wireframes

> ### Major Components
> ```
> App
> ├── NavBar
> │   ├── Component
> │   └── Component
> ├── Component
> │   ├── Component
> │   ├── Component
> │   │   └── Component
> │   └── Component
> ├── Component
> │   ├── Component
> │   └── Component
> │       └── Component
> ├── Component
> └── Component
> ```

## Example pseudocode for the project

### Database model

```javascript
const mongoose = require('mongoose');

const answeredQuestionSchema = new mongoose.Schema({
  category: String,
  content: String,
  analysis: {
    key1: String,
    key2: String
  }
}, {
  timestamps: true
})

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
      minlength: 8,
      maxlength: 100
    },
    answeredQuestions: [answeredQuestionSchema]
  }, {
  timestamps: true
  }
);
```

### Questions data model

```javascript
// array of questions
const questions = [
  // each category is an array
 [
    // questions are objects
    {
      category: 'category 1',
      content: 'this is question content?',

    },
    {
      category: 'category 1',
      content: 'this is question content?',
    }
  ],
 [
    {
      category: 'category 2',
      content: 'this is question content?',

    },
    {
      category: 'category 2',
      content: 'this is question content?',
    }
  ],

]
```

## Sources: