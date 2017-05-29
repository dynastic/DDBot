const Command = require("../../../Util/Command");
const Moderation = require("../../../Util/Moderation");
const fs = require("fs-extra-promise");

module.exports = new Command("setmodlog", "Sets the mod log channel for this guild", "<channel>", [],
    (client, message, response, args) => {
        console.log("bloop");
        if(!message.mentions.channels.first()) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify a channel to set the mod log to."));
        var channel = message.mentions.channels.first();
        var config = require('../config');
        var gID = message.guild.id;
        if(!config.guilds[gID]) config.guilds[gID] = {};
        config.guilds[gID].channel = channel.id;
        fs.writeFile(`${__dirname}/../config.json`, JSON.stringify(config, null, 4));
        return response.reply("", response.embedFactory.createSuccessEmbed(null, message.member).setDescription("The mod-log channel has been successfully set."));
    }, ["MANAGE_SERVER"]
);