const fs = require('fs');
global.Discord = require('discord.js');
global.config = require('./config/config1.json');
const client = new Discord.Client();

client.commands = new Discord.Collection();
client.extensions = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const extensionFiles = fs.readdirSync('./extensions').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

for (const file of extensionFiles) {
  const extension = require(`./extensions/${file}`);
  client.extensions.set(extension.name, extension);
}

//Code to execute every time the bot connects and is ready on Discord
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(config.flair, {type: 'PLAYING'});
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.find(ch => ch.name === 'bot-testing');
  const banner = client.extensions.get('welcomeBanner');
  const greeter = client.extensions.get('greeter');
  member.guild.fetchMember('155149108183695360').then(dyno => {
    if (dyno.presence.status === 'offline'){
      console.log("Dyno is offline. Sending the substitute welcome message.");
      try {
        greeter.execute(member, channel);
      } catch (error){
        console.error(error);
      }
    } 
  }).catch(err => {
    console.log("Dyno does not appear as a member. Sending substitute welcome message.");
    try {
      greeter.execute(member, channel);
    } catch (error){
      console.error(error);
    }
  });
  if (!channel || member.user.bot || !banner.enabled) return;
  try {
    banner.execute(member, channel);
  }
  catch (error) {
    console.error(error);
  }
});

//Code to execute whenever the bot recieves a message
client.on('message', async message => {
  /*if (message.content === '?member'){
    return client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
  };*/
  //Makes sure a message should be parsed as a command or not, if does not meet command syntax or channel or was sent by a bot skips further checks
  if (message.author.bot || !config.botchannel.some(chan => chan === message.channel.name)) return;
  if (!message.content.startsWith(config.prefix) && !message.content.startsWith(client.user)) return;
  
  //Remove the prefix and split the message into an array of each word
  var args;
  if(message.content.startsWith(config.prefix)){
    args = message.content.slice(config.prefix.length).trim().split(/ +/);
  }
  if(message.content.startsWith(client.user)){
    args = message.content.slice(client.user.id.length + 3).trim().split(/ +/);
  }
  const commandName = args.shift().toLowerCase();
  
  //Attempt to get the command by name or alias, if not found returns from checks
  const command = client.commands.get(commandName)
       || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  if (!command.enabled) return;

  //Restrict the command usage if it should be
  if(command.restricted && !message.member.hasPermission(command.permissions)) return message.channel.send("Command is restricted and you don't have permission to use it.");

  //if a command is found and requires args and is not finding args included alert the user
  if (command.args && !args.length){
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
    }
    return message.channel.send(reply);
  }
  //Attempt to execute the found command or catch an error
  try {
    command.execute(message, args);
    console.log(`${message.author.username} used the '${command.name}' command.`);
  }
  catch (error) {
    console.error(error);
  }
});

//This is for monitoring reactions added to the voting messages
/*
client.on('messageReactionAdd', reaction, user => {
  //if the reaction is not on a message in the announcements channel or the reaction was added by a bot, ignore it
  if(reaction.message.channel.name != 'announcements' || user.bot ) return;
});
*/

//Code to execute whenever there's an error
//No idea what kind of errors to expect or what to do with them
//for now this simply logs the error and continues with normal activity
client.on('error', error => {
  console.log(error.name + ": " + error.message);
});

client.on('unhandledRejection', error => console.error(`Uncaught Promise Rejection:\n${error}`));

//Code to execute on complete disconnect from Discord
client.on('disconnect', () => {
  //This SHOULD attempt to reconnect to Discord every 20 seconds until successful
  console.log('Disconnected from Discord; attempting reconnect in 20 seconds');
  setTimeout(function(){
    if(client.status.toString != 'READY'){
      console.log('Attempting to reconnect');
      client.login(config.token);
    }
  }, 20000);
});

//Connect to the server at start
client.login(config.token);