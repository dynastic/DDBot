const Command = require("../../Util/Command");
const Moderation = require("../../Util/Moderation");
const Case = require("../../Model/case");
const UserInfo = require("../../Model/userInfo");

module.exports = new Command("warn", "Warn a user", "<user> <points> [reason]", [],
    (client, message, response, args) => {
        let modUtils = new Moderation(client), user = message.mentions.users.first(), points = args[1];

        if(user == message.author) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You may not warn yourself."));
        if(!modUtils.validateUserArgument(user, args[0])) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify a user to warn."));
        if(!points) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify how many warning points to assign to the user."));
        if(isNaN([points])) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("Please enter a numeric amount of warning points to assign to the user."));
        points = parseInt(points);
        if(points <= 0) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(`The amount of points must be above zero. To remove points, use \`${client.config.prefix}liftwarn\`.`));

        let member = modUtils.userCanPerformActionError(message.member, user, message.guild);
        if(typeof member === "string") return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(member));

        let reason = args[2] ? args.slice(2).join(" ") : null;

        Case.createCase(message.author, "warn", user, message.guild, reason, points).then(newCase => {
            UserInfo.addWarningPoints(user, message.guild, points).then(userInfo => {
                let reasonMessage = reason ? `\n**Reason:** ${reason}` : "";
                user.sendMessage(`You have been warned in *${message.guild.name}* (*${points.toLocaleString()} point${points == 1 ? "" : "s"}*). You now have ${userInfo.points.toLocaleString()} point${userInfo.points == 1 ? "" : "s"}.${reasonMessage}`);
                response.reply("", response.embedFactory.createSuccessEmbed("Warned user", message.member).setDescription("The specified user was successfully warned.").addField("User", user, true).addField("Points given", points.toLocaleString(), true).addField("Total points", userInfo.points.toLocaleString(), true).addField("Case", `#${newCase.number.toLocaleString()}`, true).addField("Reason", reason || "*None provided*", true));
            }).catch(err => response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to warn the user.")));
        }).catch(err => response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to warn the user.")));
    }, ["MANAGE_GUILD"]
);