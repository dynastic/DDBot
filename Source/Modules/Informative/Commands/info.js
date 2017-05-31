const Command = require("../../../Util/Command");
const Moderation = require("../../../Util/Moderation");
const Case = require("../../../Model/case");
const UserInfo = require("../../../Model/userInfo");

module.exports = new Command("info", "View information about a user.", "<user>", ["userinfo", "whois", "userinfo", "ui", "lookupuser", "userlookup", "ul", "warnpoints"],
    (client, message, response, args) => {
        var badArgs = response.embedFactory.createErrorEmbed(null).setDescription("You did not specify a user to lookup info on.");
        if(!args[0]) return response.reply("", badArgs);
        var modUtils = new Moderation(client), user = message.mentions.users.first();
        var member = message.guild.members.get(user.id);
        if(!modUtils.validateUserArgument(user, args[0]) || !member) return response.reply("", badArgs);

        UserInfo.getMemberInfo(member, userInfo => {
            var embed = response.embedFactory.createInformativeEmbed(`Information on ${user.username}#${user.discriminator}`);
            embed.setThumbnail(user.displayAvatarURL);
            
            if(member.nickname) embed.addField("Nickname", member.nickname, true);
            embed.addField("Account created", user.createdAt.toLocaleString(), true);
            embed.addField("Joined server", member.joinedAt.toLocaleString(), true);
            embed.addField("User ID", user.id, true);
            embed.addField("Warn Points", userInfo.points.toLocaleString(), true);
            var roles = member.roles.array().filter(r => r.name != "@everyone");
            embed.addField("Roles", roles.length > 0 ? roles.map(r => r.name).join(", ") : "*None*");
            var pS = member.permissions.serialize(), permissions = Object.keys(pS).filter(k => pS[k]);
            embed.addField("Permissions", permissions.length > 0 ? (permissions.length == Object.keys(client.fullPermissions).length ? "*All*" : permissions.map(n => client.fullPermissions[n] || n).join(", ")) : "*None*");
            if(user.bot) embed.addField("Is Bot", "Yes", true);

            response.reply("", embed, true);
        });
    }, []
);