const Command = require("../../../Util/Command");
const Moderation = require("../../../Util/Moderation");
const Case = require("../../../Model/case");

module.exports = new Command("kick", "Kick a user", "<user> [reason]", [],
    (client, message, response, args) => {
        var modUtils = new Moderation(client), user = message.mentions.users.first();

        if(user == message.author) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You may not kick yourself."));
        if(!modUtils.validateUserArgument(user, args[0])) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify a user to kick."));

        var member = modUtils.userCanPerformActionError(message.member, user, message.guild);
        if(typeof member === "string") return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(member));

        var reason = args[1] ? args.slice(1).join(" ") : null;

        Case.createCase(message.author, "kick", user, message.guild, reason).then(newCase => {
            var reasonMessage = reason ? `\n**Reason:** ${reason}` : "";
            user.sendMessage(`You have been kicked from *${message.guild.name}*.${reasonMessage}`);
            member.kick().then(member => {
                response.reply("", response.embedFactory.createSuccessEmbed("Kicked user", message.member).setDescription("The specified user was successfully kicked.").addField("User", user, true).addField("Case", `#${newCase.number.toLocaleString()}`, true).addField("Reason", reason || "*None provided*", true));
            }).catch(err => {
                response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to kick the user."));
            });
        }).catch(err => response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to kick the user.")));
    }, ["KICK_MEMBERS"]
);