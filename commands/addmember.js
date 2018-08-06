const welcome = require('./welcome.json');
module.exports = {
    name: "addmember",
    alias: ["am"],
    description: "Gives a user a role.",
    args: true,
    usage: "<@member/Display Name>",
    enabled: true,
    async execute(message, args){
        const denizen = message.guild.roles.find(r => r.name === welcome.role);
        const status = message.guild.channels.find(ch => ch.name === welcome.status);
        const botChannel = message.guild.channels.find(ch => ch.name === welcome.botChannel);
        //console.log(`${welcome.role} ${welcome.status} ${welcome.botChannel}\n\n${welcome.message}`);
        if (!denizen || !status || !botChannel) return console.log("Could not find a role or channel, please double check the config file.");
        if (!message.member.roles.find(r => r.id === denizen.id)) return;
        const mentionmember = message.mentions.members.first();
        if (mentionmember) {
            return checkDyno(mentionmember);
        }

        var displayName = args[0];
        if (args.length > 1){
            for(i = 1; i < args.length; i++){
                displayName += " " + args[i];
            }
        }

        const namedMember = message.guild.members.find(val => val.displayName.toLowerCase() === displayName.toLowerCase());
        if (namedMember){
            return checkDyno(namedMember);
        }

        function checkDyno(member){
            message.guild.fetchMember('155149108183695360').then(dyno => {
                if (dyno.presence.status === 'offline') return addRole(member);
            }).catch(() => {
                return addRole(member);
            });
        }

        function addRole(member){
            if(member.roles.find(r => r.id === denizen.id)) return message.channel.send(`${member.displayName} already has the ${denizen.name} role.`);
            member.addRole(denizen).then(() => {
                message.channel.send(`Welcome to Æsir, traveler! Take a look around; I suggest you mute the ${status} and ${botChannel} channels to avoid notification spam! You'll find our community center locations pinned to their respective channels under the BASE ATLAS category! Once you join a tribe, assign yourself in discord following the Tribe Ranks guide, pinned in the ${botChannel}!`);
            }).catch(error => console.log(error));
        }
    }
}