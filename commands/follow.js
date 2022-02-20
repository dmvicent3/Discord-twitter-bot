const { SlashCommandBuilder } = require('@discordjs/builders');
const following = require('../models/follows');
const T = require('../twit');
const {startStream, stopStream} = require("../common");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('follow')
		.setDescription('Follow a cunt').addStringOption(option =>
            option.setName('handle')
                .setDescription('The cunt')
                .setRequired(true)),
	async execute(interaction) {

        const twitterHandle = interaction.options.getString('handle');
        try{
        T.get('users/lookup',{screen_name: twitterHandle}, async function(err, response) { 
          
            if(!err){
                try {
                    const follow = await following.create({
                        twitterId: response[0].id,
                        channelId: interaction.channelId.toString(),
                        handle: response[0].screen_name,
                    });
                    following.sync(/*{ force: true }*/);
                    stopStream();
                    startStream();
                    return interaction.reply('Followed https://twitter.com/'+ response[0].screen_name);
                    
                } catch (error) {
                    if (error.name === 'SequelizeUniqueConstraintError') {
                        return interaction.reply('Already following.');
                    }
        
                    return interaction.reply('????????????????');
                }
            }
        });
    }catch(error){
        console.log(error);
    }
	},
};
