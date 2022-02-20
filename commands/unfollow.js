
const { SlashCommandBuilder } = require('@discordjs/builders');
const following = require('../models/follows');
const { startStream, stopStream } = require("../common");
module.exports = {
        data: new SlashCommandBuilder()
                .setName('unfollow')
                .setDescription('Unfollow the cunt').addStringOption(option =>
                        option.setName('person')
                                .setDescription('The cunt')
                                .setRequired(true)),
        async execute(interaction) {

                const handle = interaction.options.getString('person');
                const rowCount = await following.destroy({ where: { handle: handle } });

                if (!rowCount) return interaction.reply('????????????');
                following.sync(/*{ force: true }*/);
                stopStream();
                startStream();
                return interaction.reply('Unfollowed @' + handle);
        },
};
