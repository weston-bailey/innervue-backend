require('dotenv').config();
// Imports the Google Cloud client library
const language = require(`@google-cloud/language`);
// imports IBM watson auth package
const { IamTokenManager } = require('ibm-watson/auth');
// Imports IBM watson tone analyzer
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');
// for logging
const beautify = require("json-beautify");


// check for IBM Watson API key, exit if not found
if (!process.env.TONE_ANALYZER_APIKEY) {
  console.log('This example requires the TONE_ANALYZER_APIKEY environment variable');
  process.exit(1);
}

// Maybe needed for IBM watson Auth ????? TODO 
const toneAuthenticator = new IamTokenManager({
  apikey: process.env.TONE_ANALYZER_APIKEY,
});

// Maybe needed for IBM watson Auth ????? TODO 
const test = function (req, res) {
  return toneAuthenticator
    .requestToken()
    .then(({ result }) => {
    //  console.log({ accessToken: result.access_token, url: process.env.TONE_ANALYZER_URL });
    })
    .catch(console.error);
};

test();

// The text to analyze
const text = "Hello, my name is Inigo Montoya. You killed my father. Prepare to die.";

googleCloud(text);

async function googleCloud(text) {

  // SET UP FOR GOOGLE LANGAUGE

  // Instantiates a Google langauge client
  const client = new language.LanguageServiceClient();

  // create document in google language format
  const document = {
    content: text,
    type: `PLAIN_TEXT`,
  };

  // SET UP FOR IBM WATSON

   // Instantiates an IBM Watson tone analyzer
  const toneAnalyzer = new ToneAnalyzerV3({
    // See: https://github.com/watson-developer-cloud/node-sdk#authentication
    version: '2017-09-21',
  });

  // hit all Google APIs at same time, don't proceed until all have responded
  const [analyzeSentiment, analyzeEntities, analyzeSyntax, analyzeEntitySentiment] = await Promise.all([
    client.analyzeSentiment({document: document}),
    client.analyzeEntities({document: document}), 
    client.analyzeSyntax({document: document}),
    client.analyzeEntitySentiment({document: document}),
  ])

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
          analyzeEntities,
          analyzeSyntax,
          analyzeEntitySentiment,
          analyzeTone: response.result
        }

        // TODO: Format anaylsis from APIs

        // TODO: Write anaylsis/question to database

        // TODO send analysis/question to client

        // make it pretty to explore in console
        print = beautify(payload, null, 2, 10);   
        console.log(print) 
    })
    .catch(error => console.error(error));

}



