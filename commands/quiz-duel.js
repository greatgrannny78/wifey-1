const Command = require('../../structures/Command');
const { stripIndents, oneLine } = require('common-tags');
const request = require('node-superfetch');
const { shuffle, verify } = require('../../util/Util');
const choices = ['A', 'B', 'C', 'D'];

module.exports = class QuizDuelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'quiz-duel',
			aliases: ['jeopardy-duel', 'trivia-duel'],
			group: 'games',
			memberName: 'quiz-duel',
			description: 'Answer a series of quiz questions against an opponent.',
			args: [
				{
					key: 'opponent',
					prompt: 'What user would you like to play against?',
					type: 'user'
				},
				{
					key: 'maxPts',
					label: 'maximum amount of points',
					prompt: 'What amount of points should determine the winner?',
					type: 'integer',
					min: 1,
					max: 10
				}
			]
		});

		this.playing = new Set();
	}

	async run(msg, { opponent, maxPts }) {
		if (opponent.bot) return msg.reply('Bots may not be played against.');
		if (opponent.id === msg.author.id) return msg.reply('You may not play against yourself.');
		if (this.playing.has(msg.channel.id)) return msg.reply('Only one game may be occurring per channel.');
		this.playing.add(msg.channel.id);
		try {
			await msg.say(`${opponent}, do you accept this challenge?`);
			const verification = await verify(msg.channel, opponent);
			if (!verification) {
				this.playing.delete(msg.channel.id);
				return msg.say('Looks like they declined...');
			}
			let winner = null;
			let userPoints = 0;
			let oppoPoints = 0;
			while (!winner) {
				const question = await this.fetchQuestion();
				await msg.say(stripIndents`
					**You have 15 seconds to answer this question.**
					${question.question}
					${question.answers.map((answer, i) => `**${choices[i]}.** ${answer}`).join('\n')}
				`);
				const answered = [];
				const filter = res => {
					const choice = res.content.toUpperCase();
					if (!choices.includes(choice) || answered.includes(res.author.id)) return false;
					if (![msg.author.id, opponent.id].includes(res.author.id)) return false;
					answered.push(res.author.id);
					if (question.answers[choices.indexOf(res.content.toUpperCase())] !== question.correct) {
						msg.say(`${res.author}, that's incorrect!`).catch(() => null);
						return false;
					}
					return true;
				};
				const msgs = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 15000
				});
				if (!msgs.size) {
					await msg.say(`Sorry, time is up! It was ${question.correct}.`);
					continue;
				}
				const result = msgs.first();
				const userWin = result.author.id === msg.author.id;
				if (userWin) ++userPoints;
				else ++oppoPoints;
				if (userPoints >= maxPts) winner = msg.author;
				else if (oppoPoints >= maxPts) winner = opponent;
				const score = oneLine`
					${userWin ? '**' : ''}${userPoints}${userWin ? '**' : ''} -
					${userWin ? '' : '**'}${oppoPoints}${userWin ? '' : '**'}
				`;
				await msg.say(`Nice one, ${result.author}! The score is now ${score}!`);
			}
			this.playing.delete(msg.channel.id);
			if (!winner) return msg.say('Aww, no one won...');
			return msg.say(`Congrats, ${winner}, you won!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	async fetchQuestion() {
		const { body } = await request
			.get('https://opentdb.com/api.php')
			.query({
				amount: 1,
				type: 'multiple',
				encode: 'url3986'
			});
		if (!body.results) return this.fetchQuestion();
		const question = body.results[0];
		const answers = question.incorrect_answers.map(answer => decodeURIComponent(answer.toLowerCase()));
		const correct = decodeURIComponent(question.correct_answer.toLowerCase());
		answers.push(correct);
		const shuffled = shuffle(answers);
		return {
			question: decodeURIComponent(question.question),
			answers: shuffled,
			correct
		};
	}
};
