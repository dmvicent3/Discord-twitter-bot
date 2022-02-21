const { SlashCommandBuilder } = require('@discordjs/builders');
const following = require('../models/follows');
const T = require('../services/twit');
const { startStream, stopStream, createRole } = require("../common");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('follow')
        .setDescription('Follow account').addStringOption(option =>
            option.setName('handle')
                .setDescription('Twitter handle')
                .setRequired(true)),
    async execute(interaction) {

        const twitterHandle = interaction.options.getString('handle');
        try {
            T.get('users/lookup', { screen_name: twitterHandle }, async function (err, response) {
                if (!err) {
                    try {
                        const follow = await following.create({
                            twitterId: response[0].id,
                            channelId: interaction.channelId.toString(),
                            handle: response[0].screen_name,
                        });
                        following.sync(/*{ force: true }*/);
                        console.log('Followed ' + response[0].screen_name);
                        await createRole(response[0].screen_name);
                        stopStream();
                        startStream();

                        return interaction.reply('Followed https://twitter.com/' + response[0].screen_name);

                    } catch (error) {
                        if (error.name === 'SequelizeUniqueConstraintError') {
                            return interaction.reply('Already following.');
                        }

                        return interaction.reply('????????????????');
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
    },
};

