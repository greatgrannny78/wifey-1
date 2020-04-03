const Command = require('../../structures/Command');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const { shortenText } = require('../../util/Canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });

module.exports = class NewPasswordCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'new-password',
			aliases: ['strong-password', 'new-pswd', 'strong-pswd'],
			group: 'image-edit',
			memberName: 'new-password',
			description: 'Sends a "Weak Password/Strong Password" meme with the passwords of your choice.',
			throttling: {
				usages: 1,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			args: [
				{
					key: 'weak',
					prompt: 'What should the text of the weak password be?',
					type: 'string',
					max: 50
				},
				{
					key: 'strong',
					prompt: 'What should the text of the strong password be?',
					type: 'string',
					max: 50
				}
			]
		});
	}

	async run(msg, { weak, strong }) {
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'new-password.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		ctx.font = '25px Noto';
		ctx.fillText(shortenText(ctx, weak, 390), 40, 113);
		ctx.fillText(shortenText(ctx, strong, 390), 40, 351);
		return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'new-password.png' }] });
	}
};
