const Command = require('../../structures/Command');
const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const { shortenText } = require('../../util/Canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });

module.exports = class DemotivationalPosterCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'demotivational-poster',
			aliases: ['demotivational'],
			group: 'image-edit',
			memberName: 'demotivational-poster',
			description: 'Draws an image or a user\'s avatar and the text you specify as a demotivational poster.',
			throttling: {
				usages: 1,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			args: [
				{
					key: 'title',
					prompt: 'What should the title of the poster be?',
					type: 'string',
					max: 50,
					parse: title => title.toUpperCase()
				},
				{
					key: 'text',
					prompt: 'What should the text of the poster be?',
					type: 'string',
					max: 100
				},
				{
					key: 'image',
					prompt: 'What image would you like to edit?',
					type: 'image',
					default: msg => msg.author.displayAvatarURL({ format: 'png', size: 512 })
				}
			]
		});
	}

	async run(msg, { title, text, image }) {
		try {
			const { body } = await request.get(image);
			const data = await loadImage(body);
			const canvas = createCanvas(750, 600);
			const ctx = canvas.getContext('2d');
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			let { width, height } = data;
			const maxWidth = 602;
			if (width > maxWidth) {
				const ratio = maxWidth / width;
				width = maxWidth;
				height *= ratio;
			}
			const maxHeight = 402;
			if (height > maxHeight) {
				const ratio = maxHeight / height;
				height = maxHeight;
				width *= ratio;
			}
			const x = (canvas.width / 2) - (width / 2);
			const y = 44 + ((402 / 2) - (height / 2));
			ctx.fillStyle = 'white';
			ctx.fillRect(x - 4, y - 4, width + 8, height + 8);
			ctx.fillStyle = 'black';
			ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
			ctx.fillStyle = 'white';
			ctx.fillRect(x, y, width, height);
			ctx.drawImage(data, x, y, width, height);
			ctx.textAlign = 'center';
			ctx.font = '60px Noto';
			ctx.fillStyle = 'aquamarine';
			ctx.fillText(shortenText(ctx, title, 610), 375, 518);
			ctx.font = '27px Noto';
			ctx.fillStyle = 'white';
			ctx.fillText(shortenText(ctx, text, 610), 375, 565);
			return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'demotivational-poster.png' }] });
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
