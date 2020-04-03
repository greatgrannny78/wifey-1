const Command = require('../../structures/Command');
const { MOCKING_EMOJI_ID, MOCKING_EMOJI_NAME } = process.env;

module.exports = class MockingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mocking',
			aliases: ['mock'],
			group: 'text-edit',
			memberName: 'mocking',
			description: 'SenDs TexT lIkE ThiS.',
			clientPermissions: ['USE_EXTERNAL_EMOJIS'],
			args: [
				{
					key: 'text',
					prompt: 'WHaT tEXt WoUlD yOu LiKE to COnvErt?',
					type: 'string',
					max: 1950,
					parse: text => text.toLowerCase()
				}
			]
		});
	}

	run(msg, { text }) {
		const letters = text.split('');
		for (let i = 0; i < letters.length; i += Math.floor(Math.random() * 4)) {
			letters[i] = letters[i].toUpperCase();
		}
		return msg.say(`${letters.join('')}${this.mockingEmoji}`);
	}

	get mockingEmoji() {
		return MOCKING_EMOJI_ID && MOCKING_EMOJI_NAME ? ` <:${MOCKING_EMOJI_NAME}:${MOCKING_EMOJI_ID}>` : '';
	}
};

