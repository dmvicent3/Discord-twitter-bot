const { consumer_key, consumer_secret,
	access_token, access_token_secret } = require('../config.json');
const Twit = require('twit');
var T = new Twit({
	consumer_key: consumer_key,
	consumer_secret: consumer_secret,
	access_token: access_token,
	access_token_secret: access_token_secret,
	timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
	strictSSL: true,     // optional - requires SSL certificates to be valid.
});

module.exports = T;