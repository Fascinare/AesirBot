const greet = require('./greet.json');
module.exports = {
    name: "greeter",
    async execute(member, channel){
        const rules = member.guild.channels.find(ch => ch.name === greet.rules);
        const connect = member.guild.channels.find(ch => ch.name === greet.connect);
        const info = member.guild.channels.find(ch => ch.name === greet.info);
        const greeter = member.guild.roles.find(r => r.name === greet.role);
        if(!rules || !connect || !info || !greeter) return console.log("Did not find welcome message channels or greeter role, please double check the config file.");
        channel.send(`Hello there, ${member}! Welcome to ${member.guild.name}! Please take a moment to read over our ${rules} and let us know if they are to your liking. Once you say \`I agree to the rules!\`, a ${greeter} will assign you a server role. You'll then gain access to the Community Center PIN code and our chat channels!\nThe ${info} channel links to our mod collection for easy subscription, and all connection infor can be found in ${connect}.`);
    }
}