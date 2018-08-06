//const Discord = require('discord.js');
const steamServerStatus = require('steam-server-status');
module.exports = {
    name: 'players',
    aliases: ['playercount', 'online'],
    description: 'Get player counts for all Æsir servers.',
    enabled: true,
    async execute(message, args) {
    //This command queries the 4 ARK servers and sends a discord embed which is sent once all 4 respond or timeout
    var ab = queryserver(config.ports.ab);
    var oly = queryserver(config.ports.temp);
    var rag = queryserver(config.ports.rag);
    var vol = queryserver(config.ports.volc);

    function queryserver(port){
      return new Promise(function(resolve, reject){
        steamServerStatus.getServerStatus('ark.anagaming.gq', port, function(serverInfo) {
          if (serverInfo.error) {
            reject(new Error(serverInfo.error));
          } else {
            resolve(serverInfo);
          }
        })
      })
    }

    Promise.all([
      ab.catch(error => {return error}), 
      oly.catch(error => {return error}), 
      rag.catch(error => {return error}), 
      vol.catch(error => {return error})
    ]).then(status => {
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