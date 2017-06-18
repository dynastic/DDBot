const Command = require("../../../Util/Command");
const Moderation = require("../../../Util/Moderation");
const Case = require("../../../Model/case");
const UserInfo = require("../../../Model/userInfo");

module.exports = new Command("liftwarn", "Lift warning points from a user", "<user> <points>", ["liftwarnpoints"],
    (client, message, response, args) => {
        var modUtils = new Moderation(client), user = message.mentions.users.first(), points = args[1];

        if(user == message.author) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You may not warn yourself."));
        if(!modUtils.validateUserArgument(user, args[0])) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify a user to warn."));
        if(!points) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify how many warning points to assign to the user."));
        if(isNaN([points])) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("Please enter a numeric amount of warning points to assign to the user."));
        points = parseInt(points);
        if(points <= 0) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(`The amount of points to remove must be above zero. To give points, use \`${client.config.prefix}warn\`.`));

        var member = modUtils.userCanPerformActionError(message.member, user, message.guild);
        if(typeof member === "string") return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(member));

        Case.createCase(message.author, "liftwarn", user, message.guild, null, -points).then(newCase => {
            UserInfo.addWarningPoints(user, message.guild, -points).then(userInfo => {
                response.reply("", response.embedFactory.createSuccessEmbed("Lifted warnings", message.member).setDescription("The specified number of warning points were successfully removed from the user.").addField("User", user, true).addField("Points removed", points.toLocaleString(), true).addField("Total points", userInfo.points.toLocaleString(), true).addField("Case", `#${newCase.number.toLocaleString()}`, true));
            }).catch(err => response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to lift warns from the user.")));
        }).catch(err => response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to lift warns from the user.")));
    }, ["MANAGE_GUILD"]
);