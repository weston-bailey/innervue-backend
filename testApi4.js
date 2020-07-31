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
const text = "An organization I was employed for was undergoing budget cuts due to the recession. It was a time of big change because they were restructuring the management team, closing locations, eliminating positions and moving staff around. I think what made it the most challenging was that management was not very communicative and I often heard about a new decision from a colleague instead of from the director or my manager. I was personally impacted because  I did not know if I was going to keep my job or if I was going to be moved to a different location and end up with a different schedule. In order to adapt to the change, I reached out to the communications director to provide feedback on my experience with receiving information in an appropriate and timely manner. The communications director was receptive to this feedback and started sending out a weekly newsletter to all employees regarding the discussions, plans and decisions being made at the executive level. On a personal level, I prepared for possible layoff by being proactive with my job search and this helped me see that I did have options if I ended up losing my job. ";

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
  const [analyzeSentiment, analyzeEntitySentiment] = await Promise.all([
    client.analyzeSentiment({document: document}),
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
          analyzeEntitySentiment,
          analyzeTone: response.result
        }

        // TODO: Format anaylsis from APIs
        //Detect if there is enough content to proceed with analysis
        let responseLength = analyzeTone.utterances_tone.utterance_id
        if (responseLength < 4) {
            return "We suggest you provide a longer response to fully answer the interview question and so we can provide adequate feedback."
        } else {
            // return "Here's the summary analysis of your response:"
        } 
        //Overall sentiment of response
        let score = payload.analyzeSentiment[0].documentSentiment.score
        let magnitude = payload.analyzeSentiment[0].documentSentiment.magnitude

              if (payload.analyzeSentiment[0].documentSentiment.score >= 0.5 && payload.analyzeSentiment[0].documentSentiment.magnitude >= 3.0) {
                return "You response reflects a clearly positive sentiment. This will appeal to interviewers!"
              } else if (payload.analyzeSentiment[0].documentSentiment.score = 0.0 && payload.analyzeSentiment[0].documentSentiment.magnitude === 0) { 
                  return "Your response is looking good, try modifying it some more to make it more impactful."
              } else if (payload.analyzeSentiment[0].documentSentiment.score <= -0.05 && payload.analyzeSentiment[0].documentSentiment.magnitude === 4.0) {
              return  "Your response reflects a negative sentiment. We suggest modifying your response to communicate more effectively." 
              } 

        //Detect if there is negative entity sentiment
            //target mentions in 
            analyzeEntitySentiment[0].entities.forEach(mention => {
              if(mention.sentiment.score < -.5){
                console.log('less than -.5')
                console.log(`The response reflects a negative sentiment towards ${mention.name}. We suggest modifying your word choices to neutralize how this comes across.`)
                // route should return json with message
              }
            })
        //Print emotions detected:
        payload.analyzeTone.utterances_tone.forEach(utterance => {
          if(utterance.tones.length > 0){
            // add found tones to database and send to client
            let foundTones = []
            utterance.tones.forEach(tone => {
              foundTones.push(tone.tone_id);
            })
            console.log(foundTones)
            console.log( `The emotion(s) we detected: ${tone_name}. Do they properly reflect what you want your interviewers to know?`)
          } else {
            // no tones found!
            console.log('no tones!')
          }
        })
        
        
       
        // TODO: Write anaylsis/question to database

        // TODO send analysis/question to client

        // make it pretty to explore in console
        print = beautify(payload, null, 2, 10);   
        console.log(print) 
    })
    .catch(error => console.error(error));

}



