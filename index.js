const { token } = require('./config.json');
const fs = require('fs');
const following = require('./models/follows');
const { client } = require('./services/discordjs');
const { startStream } = require("./common");
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.on('ready', () => {
	following.sync(/*{ force: true }*/);
	console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.once('ready', async () => {
	startStream();
})
