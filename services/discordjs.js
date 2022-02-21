const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

module.exports = {
    client: client,
    getGuild: async function getGuild() {
        const getGuild = await client.guilds.fetch();
        const guildId = getGuild.map(t => t.id);
        return client.guilds.cache.get(guildId[0]);
    }
};
