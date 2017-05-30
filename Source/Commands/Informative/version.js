const Command = require("../../Util/Command");
const Discord = require("discord.js");

module.exports = new Command("version", "Gets the DDBot version", null, ["v", "ver", "build"],
    (client, message, response) => {
        response.reply("", new Discord.RichEmbed({ "title": "Version", "color": 0x7289DA }).setDescription(`${client.config.botName} v${client.meta.version}`).setThumbnail(client.user.avatarURL), true);
    }, [], false, true
);