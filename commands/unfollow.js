const { SlashCommandBuilder } = require('@discordjs/builders');
const following = require('../models/follows');
const { startStream, stopStream, deleteRole } = require("../common");

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
                console.log('Unfollowed '+ handle);
                await deleteRole(handle);
                stopStream();
                startStream();
                
                
                return interaction.reply('Unfollowed @' + handle);
        },
};