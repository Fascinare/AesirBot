const Jimp = require("jimp");
const fs = require('fs');
var rawdata = fs.readFileSync('./commands/donations.json');
const donations = JSON.parse(rawdata);
var total = parseFloat(donations.total);
var goal = donations.goal;
var percent = 0;
var goaltitle = donations.goaltitle;
module.exports = {
    name: 'donations',
    description: 'Managed updating of donation totals and progress.',
    args: true,
    usage: "<add/settotal/setgoal> <value>",
    enabled: true,
    restricted: true,
    permissions: "ADMINISTRATOR",
    execute(message, args){

        if(args[0] === "update") return calculate();

        if(args[0] === "setgoaltitle"){
            let title = "";
            for (i = 1; i < args.length; i++){
                title += args[i]+" ";
            }
            goaltitle = title.trim();
            donations.goaltitle = goaltitle;
            saveFile();
            return;
        }

        if(args.length <= 1 || Number.isNaN(parseInt(args[1]))) return message.channel.send("Please supply a number to add to the total.");
        
        if(args[0] === "setgoal"){
            //set and store the current goal for the donation tracker
            let value = parseInt(args[1]);
            if(value < 0) value = value * -1;
            goal = value;
            donations.goal = goal;
            saveFile();
            return;
        }

        if(args[0] === "settotal"){
            //set the current total amount
            let value = parseFloat(args[1]);
            if(value < 0) value = value * -1;
            total = Math.round(value * 100) / 100;
            donations.total = parseFloat(total).toFixed(2);
            saveFile();
            return;
        }

        if(args[0] === "add"){
            //add to the current total and update the tracker
            let value = parseFloat(args[1]);
            if(value < 0) value = value * -1;
            total += Math.round(value * 100) / 100;
            donations.total = parseFloat(total).toFixed(2);
            saveFile();
            calculate();
        }

        function calculate(){
            percent = total / goal;
            let width = Math.floor(percent * 600);
            percent = Math.round(percent * 100);
            setprogress(width);
        }
        
        function setprogress(width){
            if(width > 600) width = 600;
            if(width === 0) width = 1;
            Jimp.read("./images/progressbar.png").then(function (bar) {
            bar.resize(width, 40);
            combine(bar);
            }).catch(function (err){
                console.error(err);
            });
        }
        
        function combine(bar){
            Jimp.read("./images/progressbg.png").then(function (bg) {
                bg.composite( bar, 5, 5).write("./images/final.png");
                setTimeout(sendMessage,100);
            }).catch(function (err){
                console.error(err);
            });
        }

        function saveFile(){
            fs.writeFile('./donations.json', JSON.stringify(donations, null, 4), function (err){
                if(err) return console.log(err);
            })
        }

        function sendMessage(){
            var attach = new Discord.Attachment("./images/final.png", "final.png");
            var embed = new Discord.RichEmbed()
            .setColor(1806636)
            .setTitle("Æsir Neo Arcadia Donation Tracker")
            .setDescription(`Current Goal: **${goaltitle}** - *$${goal}*\nProgress: $${parseFloat(total).toFixed(2)} / $${goal} *(${percent}%)*`)
            .attachFile(attach);

            if(message.guild.available){
                var channels = message.guild.channels;
                var chan = channels.find('name', donations.channel);
                chan.fetchMessage(donations.messageID)
                .then(message => message.delete()
                    .then(send(chan))
                    .catch(console.error))
                .catch(function (err){
                    send(chan);
                    console.log(err);
                });
                return;
            }

            function send(channel){
                channel.send({embed})
                .then(function(msg){
                    donations.messageID = msg.id;
                    saveFile();
                })
                .catch(console.error);
            }
            
        }
    }
};