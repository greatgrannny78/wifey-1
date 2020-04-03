const Command = require('../../structures/Command');
const Random = require('random-js');
const texts = require('../../assets/json/coolness');

module.exports = class CoolnessCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'coolness',
			group: 'analyze',
			memberName: 'coolness',
			description: 'Determines a user\'s coolness.',
			args: [
				{
					key: 'user',
					prompt: 'Which user do you want to determine the coolness of?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}

	run(msg, { user }) {
		const authorUser = user.id === msg.author.id;
		if (user.id === this.client.user.id) return msg.reply('Me? I think I\'m the very best, like no one ever was.');
		if (this.client.isOwner(user)) {
			if (authorUser) return msg.reply('You\'re the best owner a bot could ask for! ❤');
			return msg.reply(`Don't tell them I said this but I think ${user.username} smells like a sack of diapers.`);
		}
		const random = new Random(Random.engines.mt19937().seed(user.id));
		const coolness = random.integer(0, texts.length - 1);
		return msg.reply(`${authorUser ? 'You are' : `${user.username} is`} ${texts[coolness]}`);
	}
};
