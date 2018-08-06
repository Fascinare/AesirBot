const { registerFont, createCanvas, loadImage } = require('canvas');
registerFont('./fonts/NotoSans-Regular.ttf', {family: 'Noto Sans'});
registerFont('./fonts/TitilliumWeb-Regular.ttf', {family: "TitilliumWeb"});
const snekfetch = require('snekfetch');

module.exports = {
    name: "welcomeBanner",
    enabled: false,
    async execute(member, channel){
        //Generate a nice lovely image welcome for the new member here!
        const cvs = createCanvas(800, 200),
        ctx = cvs.getContext('2d');

        const background = await loadImage('./images/bg.jpg');
        ctx.drawImage(background, 0, 0, cvs.width, cvs.height);

        const { body: buffer } = await snekfetch.get(member.user.displayAvatarURL);
        const avatar = await loadImage(buffer);

        ctx.font = '32px "TitilliumWeb"';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Welcome to Æsir,', cvs.width / 2.5, cvs.height / 3.5);

        ctx.font = applyText(cvs, member.displayName);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(member.displayName, cvs.width / 2.5, cvs.height /1.8);

        ctx.beginPath();
        ctx.arc(100, 100, 75, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(avatar, 25, 25, 150, 150);

        const attachment = new Discord.Attachment(cvs.toBuffer(), 'welcome-image.png');

        return channel.send(attachment);
    }
}
const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');
    let fontSize = 70;
    do {
        ctx.font = `${fontSize -= 10}px "TitilliumWeb"`;
    } while (ctx.measureText(text).width > canvas.width - 300);
    return ctx.font;
};