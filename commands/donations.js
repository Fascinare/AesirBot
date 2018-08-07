const fs = require('fs');
const { registerFont, createCanvas, loadImage } = require('canvas');
registerFont('./fonts/TitilliumWeb-Regular.ttf', {family: "TitilliumWeb"});
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
    async execute(message, args){

        const cvs = createCanvas(400, 160),
        ctx = cvs.getContext('2d');
        const background = await loadImage('./images/bg.png');
        const bar = await loadImage('./images/bar.png');
        const overlay = await loadImage('./images/overlay.png');
        ctx.drawImage(background, 0, 0);

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
            let width = Math.floor((percent * 392) + 4);
            percent = Math.round(percent * 100);
            if(width > 400) width = 400;
            if(width === 0) width = 1;
            ctx.drawImage(bar, 0, 0, width, bar.height, 0, 0, width, bar.height);
            ctx.drawImage(overlay, 0, 0);
            ctx.font = '16px "TitilliumWeb"';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`Current Goal: ${goaltitle} - $${goal}`, 3, 146);
            sendMessage();
        }

        function saveFile(){
            fs.writeFile('./commands/donations.json', JSON.stringify(donations, null, 4), function (err){
                if(err) return console.log(err);
            })
        }

        function sendMessage(){
            var attach = new Discord.Attachment(cvs.toBuffer(), "donation-tracker.png");

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
                channel.send(attach)
                .then(function(msg){
                    donations.messageID = msg.id;
                    saveFile();
                })
                .catch(console.error);
            }
            
        }
    }
};