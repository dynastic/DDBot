const Discord = require("discord.js");
const Command = require("../../Util/Command");
const Moderation = require("../../Util/Moderation");

module.exports = new Command("nick", "Set a nickname", "[user] [nickname]", ["setnick", "setnickname", "nickname"],
    (client, message, response, args) => {
        let modUtils = new Moderation(client);
        let canChangeOtherNicknames = message.member.hasPermission("MANAGE_NICKNAMES"), canChangeOwnNickname = message.member.hasPermission("CHANGE_NICKNAME");
        var user = message.mentions.users.first();

        if(!canChangeOtherNicknames && !canChangeOwnNickname) return response.reply("", response.embedFactory.createBadPermsEmbed());

        if(args.count < 1) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("Please specify at least a user or nickname to set."));

        let validUser = user && modUtils.validateUserArgument(user, args[0]);
        if(!validUser) { user = message.author; }
        let nick = args[validUser ? 1 : 0] || "";

        if(!canChangeOwnNickname && !validUser) return response.reply("", response.embedFactory.createBadPermsEmbed());
        if(!canChangeOtherNicknames && validUser) return response.reply("", response.embedFactory.createBadPermsEmbed());

        let member = modUtils.userCanPerformActionError(message.member, user, message.guild);
        if(typeof member === "string") return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(member));
        if(!validUser) { member = message.member; }

        if(Discord.Role.comparePositions(message.member.highestRole, member.highestRole) <= 0 && user != message.author) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You can't perform actions with a role higher than your highest role."))

        member.setNickname(nick).then(member => {
            response.reply("", response.embedFactory.createSuccessEmbed("Set nickname", message.member).setDescription("The specified nickname was successfully set on the user.").addField("User", user, true).addField("New Nickname", nick == "" ? "*Nickname cleared*" : nick, true));
        }).catch(err => {
            client.log(err, true);
            response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to set the user's nickname."));
        })
    }
);