const Command = require("../../Util/Command");
const Discord = require("discord.js");
const GuildConfig = require("../../Model/guild");
const util = require("util");

module.exports = new Command("delegate", "Delegate guild management to a user", "<guild id> <user id>", [],
    (client, message, response, args) => {
        if(args.length != 2) return response.reply("", response.embedFactory.createErrorEmbed("Invalid Arguments", message.member).setDescription("Please specify exactly two arguments"));
        var guild = args[0];
        if (guild == client.user.id) return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`<@${client.user.id}> cannot be delegated to a guild.`))
        var user = args[1];
        var config = GuildConfig.findOne({snowflake: guild}, (err, docs) => {
            if (err) return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`Something went wrong while delegating ownership:\n\`\`\`${err}\`\`\``));
            if (!docs) return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`${message.client.config.botName} is not a member of that guild.`));
            if (!client.guilds.get(guild)) return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`${message.client.config.botName} is not a member of that guild.`));
            if (!client.guilds.get(guild).members.get(user)) return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`<@${user}> is not a member of that guild.`));
            docs.delegate = user;
            docs.save();
            client.guilds.get(guild).manager.properties = docs;
            return response.reply("", response.embedFactory.createSuccessEmbed("Guild Ownership Delegated", message.member).setDescription(`Guild was successfully delegated to <@${user}>`));
        })
    }, [], true, true
);
