// Imports the Google Cloud client library
const language = require('@google-cloud/language');
const beautify = require("json-beautify");
const chalk = require('chalk');
const toolbox = require('./private/toolbox');

// The text to analyze
const text = "Hello, my name is Inigo Montoya. You killed my father. Prepare to die.";

const document = {
  content: text,
  type: 'PLAIN_TEXT',
};

googleCloud(document);

function googleCloud(document) {

  // Instantiates a client
  const client = new language.LanguageServiceClient();
 
  // Detects the sentiment of the text
  client.analyzeSentiment({document: document})
    .then((result) => {
      result = beautify(result, null, 2, 10);
      logWhite('Analyze Sentiment:')
      console.log(result);
    })
    .catch(error => {
      toolbox.logError(error)
    })
 
  // Detects entities in the text
  client.analyzeEntities({document: document})
    .then((result) => {
      result = beautify(result, null, 2, 10);
      logWhite('Detect entities:')
      console.log(result);
    })
    .catch(error => {
      toolbox.logError(error)
    })
 
  // Analyze Syntax in the text
  client.analyzeSyntax({document: document})
    .then((result) => {
      result = beautify(result, null, 2, 10);
      logWhite('Analyze Syntax:')
      console.log(result);
    })
    .catch(error => {
      toolbox.logError(error)
    })
 
  // Analyze entity Sentiment in the text
  client.analyzeEntitySentiment({document: document})
    .then((result) => {
      result = beautify(result, null, 2, 10);
      logWhite('Analyze Entity Sentiment:')
      console.log(result);
    })
    .catch(error => {
      toolbox.logError(error)
    })
 
  // Classify text (needs to be a certian length......)
  client.classifyText({document: document})
    .then((result) => {
      result = beautify(result, null, 2, 10);
      logWhite('Classify text:')
      console.log(result);
    })
    .catch(error => {
      toolbox.logError(error)
    })

}

function logWhite(log){
  console.log(chalk.black.bold.bgWhite(log)); 
}
