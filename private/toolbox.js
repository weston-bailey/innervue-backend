const chalk = require('chalk');

//export utility funcitons
module.exports = {
  //visible errors
  logError: function(){
    console.log(`${chalk.black.bgRed.bold(`ლ(ಠ益ಠლ)`)}🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥${chalk.red.bold(`BEGIN ERROR LOG`)}🔥🔥🔥🔥🔥🔥🔥${chalk.black.bgRed.bold(`‎(╯ ಥ益ಥ )╯ ┻━┻ `)}`);
    for (let i = 0; i < arguments.length; i++) {
      console.log(arguments[i]);
    }
    console.log(`${chalk.black.bgRed.bold(`\･┻━┻︵╰(ಥДಥ╰)`)}🔥🔥🔥🔥🔥🔥🔥🔥🔥${chalk.red.bold(`END ERROR LOG`)}🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥${chalk.black.bgRed.bold(`(ノ\`Д ́)ノ`)}`);
  },
  //visible log
  log: function(){
    console.log((`${chalk.black.bgGreen.bold(`└[∵┌]`)}👾👾👾👾👾👾👾👾👾👾👾${chalk.green.bold(`BEGIN └[ ∵ ]┘ LOG`)}👾👾👾👾👾👾👾👾👾👾👾${chalk.black.bgGreen.bold(`[┐∵]┘`)}`));
    for (let i = 0; i < arguments.length; i++) {
      console.log(arguments[i]);
    }
    console.log((`${chalk.black.bgGreen.bold(`└[∵┌]`)}👾👾👾👾👾👾👾👾👾👾👾${chalk.green.bold(`END └[ ∵ ]┘ LOG`)}👾👾👾👾👾👾👾👾👾👾👾👾${chalk.black.bgGreen.bold(`[┐∵]┘`)}`));
  },
  // errors to throw if needed enviromental varaibes aren't found
  jwtSecretError: `JwtStrategy requires a secret or key for Auth!\nplease add ${chalk.black.bold.bgYellow('JWT_SECRET=<your_secret_key_here>')}\nto your ${chalk.black.bold.bgYellow('.env')} file and restart nodemon\n(your secret key can be any string without spaces)`,
  envError: function(){
    let messages = []
    if(!process.env.JWT_SECRET) messages.push(this.jwtSecretError);

    if (messages.length > 0) messages.forEach(message => this.logError(message));
  }
}