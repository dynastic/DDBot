const Command = require("../../../Util/Command");
const yt = require('ytdl-core');

module.exports = new Command("play", "plays a song from youtube", "<url>", ["yt"],
    (client, message, response, args) => {
        if(!message.member.voiceChannel) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You need to be in a voice channel."));
        message.member.voiceChannel.join().then(connection => {
            var stream = yt(args[0] || "https://www.youtube.com/watch?v=dQw4w9WgXcQ", {audioonly: true});
            const dispatcher = connnection.playStream(stream);
            dispatcher.on('end', () => {
                message.member.voiceChannel.leave();
            });
        }).catch(e => client.log(e, true));
    }
);