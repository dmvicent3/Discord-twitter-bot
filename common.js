const following = require('./models/follows');
const T = require('./services/twit');
const { client, getGuild } = require('./services/discordjs');

function isReply(tweet) {
    if ( /*tweet.retweeted_status
        ||*/ tweet.in_reply_to_status_id
        || tweet.in_reply_to_status_id_str
        || tweet.in_reply_to_user_id
        || tweet.in_reply_to_user_id_str
        || tweet.in_reply_to_screen_name)
        return true
}

function getRoles(guild) {
    function toJson(item) {
        return { name: item.name, id: item.id };
    }
    return guild.roles.cache.map(r => toJson(r));
}

async function getRoleId(handle) {
    let guild = await getGuild();
    const roles = getRoles(guild);
    index = roles.findIndex(t => t.name === handle);

    return roles[index].id;
}

async function roleExists(handle) {
    let guild = await getGuild();

    if (guild.roles.cache.some(r => [handle].includes(r.name))) {
        return true;
    } else {
        return false;
    }
}

async function getChannelId(handle) {
    const follow = await following.findOne({ where: { handle: handle } });

    if (follow) {
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
        console.log('No follows found');
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
        follows = followList.map(t => t.twitterId).join(', ') || '';
    }
    return follows;
}

var stream;
module.exports = {
    startStream: async function startStream() {
        console.log('Starting Stream')
        const follows = await getFollowings();
        console.log('Currently following: ' + follows)
        stream = T.stream('statuses/filter', { follow: follows })

        stream.on('tweet', async function (tweet) {
            const handles = await getHandles();
            if (handles.includes(tweet.user.screen_name)) {
                if (!isReply(tweet)) {
                    console.log('Posted tweet by ' + tweet.user.screen_name);
                    if (!tweet.retweeted_status) {
                        var url = "<@&" + await getRoleId(tweet.user.screen_name) + "> tweeted https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
                    } else {
                        var url = "<@&" + await getRoleId(tweet.user.screen_name) + "> retweeted: https://twitter.com/" + tweet.retweeted_status.user.screen_name + "/status/" + tweet.retweeted_status.id_str;
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
        let guild = await getGuild();

        guild.roles.create({
            name: handle,
            color: 'BLUE',
            reason: 'idk',
        })
            .then(console.log('Created role ' + handle))
            .catch(console.error);
    },
    deleteRole: async function deleteRole(handle) {
        let guild = await getGuild();
        const roles = getRoles(guild);
        index = roles.findIndex(t => t.name === handle);

        guild.roles.delete(roles[index].id, 'The role needed to go')
            .then(console.log(`Deleted role ${roles[index].name}`))
            .catch(console.error);
    }
};