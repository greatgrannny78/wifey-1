const { Command } = require('discord.js-commando');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const { wrapText } = require('../../util/Canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });

module.exports = class IllegalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'illegal',
			aliases: ['is-now-illegal', 'trump', 'first-order-of-business'],
			group: 'image-edit',
			memberName: 'illegal',
			description: 'Makes President Trump make your text illegal.',
			throttling: {
				usages: 1,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			args: [
				{
					key: 'text',
					prompt: 'What should the text of the bill be?',
					type: 'string',
					max: 20,
					parse: text => text.toUpperCase()
				},
				{
					key: 'verb',
					prompt: 'Should the text use is, are, or am?',
					type: 'string',
					default: 'IS',
					oneOf: ['is', 'are', 'am'],
					parse: verb => verb.toUpperCase()
				}
			]
		});
	}

	async run(msg, { text, verb }) {
		const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'illegal.png'));
		const canvas = createCanvas(base.width, base.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(base, 0, 0);
		ctx.rotate(7 * (Math.PI / 180));
		const illegalText = `${text} ${verb} NOW ILLEGAL.`;
		let fontSize = 45;
		ctx.font = `${fontSize}px Noto`;
		while (ctx.measureText(illegalText).width > 550) {
			fontSize -= 1;
			ctx.font = `${fontSize}px Noto`;
		}
		const lines = await wrapText(ctx, illegalText, 200);
		ctx.fillText(lines.join('\n'), 750, 290);
		ctx.rotate(-7 * (Math.PI / 180));
		return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'illegal.png' }] });
	}
};
