const Command = require('../../structures/Command');
const request = require('node-superfetch');

module.exports = class ShieldsIoBadgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'shields-io-badge',
			aliases: ['shields-io', 'img-shields-io'],
			group: 'image-edit',
			memberName: 'shields-io-badge',
			description: 'Creates a badge from shields.io.',
			clientPermissions: ['ATTACH_FILES'],
			args: [
				{
					key: 'subject',
					prompt: 'What is the subject of the badge?',
					type: 'string',
					parse: subject => encodeURIComponent(subject.replace(/-/g, '--').replace(/_/g, '__'))
				},
				{
					key: 'status',
					prompt: 'What is the status of the badge?',
					type: 'string',
					parse: status => encodeURIComponent(status.replace(/-/g, '--').replace(/_/g, '__'))
				},
				{
					key: 'color',
					prompt: 'What is the color of the badge?',
					type: 'string',
					default: 'brightgreen'
				}
			]
		});
	}

	async run(msg, { subject, status, color }) {
		try {
			const { body } = await request.get(`https://img.shields.io/badge/${subject}-${status}-${color}.png`);
			return msg.say({ files: [{ attachment: body, name: 'badge.png' }] });
		} catch (err) {
			if (err.status === 404) return msg.reply('Could not create the badge...');
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
