
const { SlashCommandBuilder } = require('@discordjs/builders');
const following = require('../models/follows');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showfollows')
		.setDescription('Show follows'),
	async execute(interaction) {

		// equivalent to: SELECT name FROM tags;
		const followList = await following.findAll({ attributes: ['handle'] });
		console.log(followList)
		const followString = followList.map(t => t.handle).join(', ') || 'No follows set.';

		return interaction.reply(`List of follows: ${followString}`);

	},
};
