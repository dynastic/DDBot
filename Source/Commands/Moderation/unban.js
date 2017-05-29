const Command = require("../../Util/Command");
const Moderation = require("../../Util/Moderation");
const Case = require("../../Model/case");

module.exports = new Command("unban", "Unban a user", "<username/userID>", [],
    (client, message, response, args) => {
        var modUtils = new Moderation(client);

        if(!args[0]) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify a user to unban."));

        var userStr = args.join(" ");

        message.guild.fetchBans().then(bans => {
            var foundUser = false;
            bans.array().forEach(function(user) {
                if(modUtils.stringLooselyMatchesUser(userStr, user)) {
                    foundUser = true;
                    Case.createCase(message.author, "unban", user, message.guild).then(newCase => {
                        message.guild.unban(user.id).then(user => {
                            response.reply("", response.embedFactory.createSuccessEmbed("Banned user", message.member).setDescription("The specified user was successfully unbanned.").addField("User", user, true).addField("Case", `#${newCase.number.toLocaleString()}`, true));
                        }).catch(err => {
                            response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to unban the user."));
                        })
                    }).catch(err => response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to unban the user.")));
                }
            });
            if(!foundUser) {
                response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("Could not find a banned user with that name or ID."));
            }
        });
    }, ["BAN_MEMBERS"]
);