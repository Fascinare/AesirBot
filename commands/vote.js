var timeoutMessage = "Vote builder timed out. Please use the vote command again to start over."
var voteOptionCount = 0;
var PouchDB = require('pouchdb');
var voteBuild = {
    "_id": 0,
    "description": "",
    "options": [],
    "emotes": [],
    "dateStart": "",
    "dateEnd": ""
};
module.exports = {
    name: 'vote',
    args: true,
    usage: "<count of vote options>",
    restricted: true,
    permissions: "ADMINISTRATOR",
    enabled: false,
    description: 'Create a managed vote with a provided description, option count, end date and vote option names/values and emotes.',
    execute(message, args){
        voteOptionCount = args[0];
        const filter = m => m.author.username === message.author.username;
        message.channel.send("Starting to build a new vote! Please provide a description now.").then(() => {
            //Await a response for setting a vote description
            message.channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
            .then(collected => {
                //save description to vote object
                getVoteOptions(message.channel)
            })
            .catch(collected => {
                message.channel.send(timeoutMessage);
            });
        });

        function getVoteOptions(channel){
            channel.send(`Please provide your ${voteOptionCount} vote options and emotes **each in a separate message** now.`).then(msg => {
                var collector = msg.channel.createMessageCollector(filter, {maxMatches: voteOptionCount, time: 60000 });
                collector.on('collect', m => {
                    //try to separate vote message from emote
                    //save message and emote to vote object
                });
                collector.on('end', collected => {
                    //check to see if the collection of collected messages matches the max matches
                    //if it does not the collector timed out
                    //if it didn't time out and did match the count requested start to build and publish the vote and save the collected vote onject details to json
                });
            });
        }
    }
};