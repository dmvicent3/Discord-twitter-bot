const { SlashCommandBuilder } = require('@discordjs/builders');
const following = require('../models/follows');
const { startStream, stopStream } = require("../common");
const client = require('../services/discordjs');

module.exports = {
        data: new SlashCommandBuilder()
                .setName('unfollow')
                .setDescription('Unfollow account').addStringOption(option =>
                        option.setName('handle')
                                .setDescription('Twitter handle')
                                .setRequired(true)),
        async execute(interaction) {

                const handle = interaction.options.getString('handle');
                const rowCount = await following.destroy({ where: { handle: handle } });

                if (!rowCount) return interaction.reply('????????????');
                following.sync(/*{ force: true }*/);
                await deleteRole(handle);
                stopStream();
                startStream();
                return interaction.reply('Unfollowed @' + handle);
        },
};

async function deleteRole(handle) {
        const getGuild = await client.guilds.fetch();
        const guildId = getGuild.map(t => t.id);
        let guild = client.guilds.cache.get(guildId[0]);

        function toJson(item) {
                return { name: item.name, id: item.id };
        }

        const roles = guild.roles.cache.map(r => toJson(r));
        index = roles.findIndex(t => t.name === handle);

        guild.roles.delete(roles[index].id, 'The role needed to go')
                .then(deleted => console.log(`Deleted role ${roles[index].name}`))
                .catch(console.error);
}