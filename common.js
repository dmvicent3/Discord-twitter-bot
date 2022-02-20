const following = require('./models/follows');
const T = require('./services/twit');
const client = require('./services/discordjs');

function isReply(tweet) {
    if ( /*tweet.retweeted_status
        ||*/ tweet.in_reply_to_status_id
        || tweet.in_reply_to_status_id_str
        || tweet.in_reply_to_user_id
        || tweet.in_reply_to_user_id_str
        || tweet.in_reply_to_screen_name)
        return true
}

async function getRoleId(handle) {
    const getGuild = await client.guilds.fetch();
    const guildId = getGuild.map(t => t.id);
    let guild = client.guilds.cache.get(guildId[0]);

    function toJson(item) {
        return { name: item.name, id: item.id };
    }
    const roles = guild.roles.cache.map(r => toJson(r));

    index = roles.findIndex(t => t.name === handle);
    console.log(roles[index])
    return roles[index].id;
}

async function roleExists(handle) {
    const getGuild = await client.guilds.fetch();
    const guildId = getGuild.map(t => t.id);
    let guild = client.guilds.cache.get(guildId[0]);

    if (guild.roles.cache.some(r => [handle].includes(r.name))) {
        return true;
    } else {
        return false;
    }
}

async function getChannelId(handle) {
    console.log(handle)
    // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
    const follow = await following.findOne({ where: { handle: handle } });

    if (follow) {
        //console.log(follow)
        return follow.channelId;
    } else {
        return 0;
    }
}

async function getHandles() {
    const handles = await following.findAll({ attributes: ['handle'] });
    const handleList = handles.map(t => t.handle);
    return handleList;
}

async function getFollowings() {
    let follows = null;
    const followList = await following.findAll({ attributes: ['twitterId'] });

    if (followList.length <= 0) {
        console.log(123);
        try {
            const follow = following.create({
                twitterId: 985500940319981568,
                channelId: '275717460316127232',
                handle: '12x_hy',
            });
            following.sync(/*{ force: true }*/);
            follows = '985500940319981568';
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log(321);
        follows = followList.map(t => t.twitterId).join(', ') || '';
    }
    return follows;
}

var stream;
module.exports = {
    startStream: async function startStream() {
        console.log('Starting Stream')
        const follows = await getFollowings();
        console.log(follows)
        stream = T.stream('statuses/filter', { follow: follows })

        stream.on('tweet', async function (tweet) {
            const handles = await getHandles();
            if (handles.includes(tweet.user.screen_name)) {
                if (!isReply(tweet)) {
                    console.log(tweet);
                    if (!tweet.retweeted_status) {
                        var url = "<@&" + await getRoleId(tweet.user.screen_name) + "> tweeted https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
                    } else {
                        var url = "@" + tweet.user.screen_name + " retweeted: https://twitter.com/" + tweet.retweeted_status.user.screen_name + "/status/" + tweet.retweeted_status.id_str;
                    }

                    try {
                        const channelId = await getChannelId(tweet.user.screen_name);
                        let channel = client.channels.fetch(BigInt(channelId)).then(channel => {
                            channel.send(url)
                        }).catch(err => {
                            console.log(err)
                        })
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        })
    },
    stopStream: function stopStream() {
        console.log('Stopping the Stream');
        stream.stop();
    },
    createRole: async function createRole(handle) {
        const getGuild = await client.guilds.fetch();
        const guildId = getGuild.map(t => t.id);
        let guild = client.guilds.cache.get(guildId[0]);
        console.log(guild)
        guild.roles.create({
            name: handle,
            color: 'BLUE',
            reason: 'idk',
        })
            .then(console.log)
            .catch(console.error);
    },
};