// Imports the Google Cloud client library
const language = require(`@google-cloud/language`);
const beautify = require("json-beautify");
const chalk = require(`chalk`);

// The text to analyze
const text = "Hello, my name is Inigo Montoya. You killed my father. Prepare to die.";

const document = {
  content: text,
  type: `PLAIN_TEXT`,
};

async function googleCloud(document) {
  // Instantiates a client
  const client = new language.LanguageServiceClient();

  // hit all APIs at same time, don't proceed until all have responded
  const [analyzeSentiment, analyzeEntities, analyzeSyntax, analyzeEntitySentiment] = await Promise.all([
    client.analyzeSentiment({document: document}),
    client.analyzeEntities({document: document}), 
    client.analyzeSyntax({document: document}),
    client.analyzeEntitySentiment({document: document}),
  ]);

  // load up an object with data from the APIs
  let payload = {
    analyzeSentiment,
    analyzeEntities,
    analyzeSyntax,
    analyzeEntitySentiment
  }

  // make it pretty
  print = beautify(payload, null, 2, 10);   
  console.log(print) 

}

googleCloud(document);


