//const Discord = require('discord.js');
const steamServerStatus = require('steam-server-status');
module.exports = {
    name: 'players',
    aliases: ['playercount', 'online'],
    description: 'Get player counts for all Æsir servers.',
    enabled: true,
    async execute(message, args) {

    var servers = [];
    for (i = 0; i < config.ports.length; i++){
      servers.push(queryserver(config.ports[i]));
    }
    
    function queryserver(port){
      return new Promise(function(resolve, reject){
        steamServerStatus.getServerStatus('ark.anagaming.gq', port, function(serverInfo) {
          if (serverInfo.error) {
            reject(new Error(serverInfo.error));
          } else {
            resolve(serverInfo);
          }
        })
      }).catch(error => {return error})
    }

    Promise.all(servers).then(status => {
      var richEmbed = new Discord.RichEmbed().setColor(15304590);
      for (i = 0; i < status.length; i++){
        if (status[i].name === "Error"){
          richEmbed.addField(status[i].name, status[i].message, false);
        } else {
          var str = "Players: " + status[i].numberOfPlayers + "/" + status[i].maxNumberOfPlayers;
          richEmbed.addField(status[i].map, str, false);
        }
      }
      sendMessage(richEmbed);
    });
    function sendMessage(embed){
      message.channel.send({embed});
    }
    },
};