const Sequelize = require('sequelize');
const sequelize = require('../services/sqlite');

 const following = sequelize.define('following', {
	twitterId: {
		type: Sequelize.INTEGER,
		unique: true,
        allowNull: false,
	},
	channelId: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	handle: {
		type: Sequelize.STRING,
		allowNull: false,
	},
});

module.exports = following;