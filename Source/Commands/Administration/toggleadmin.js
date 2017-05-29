const Command = require("../../Util/Command");

module.exports = new Command("toggleadmin", "List current admins or toggle admin status on a user", "[user]", ["admin", "administrator", "admins", "administrators", "listadmins", "listadministrators", "setadmin", "manageadmin", "addadmin", "remadmin", "rmadmin", "removeadmin", "deladmin", "deleteadmin"],
    (client, message, response) => {
        let user = message.mentions.users.first();
        if(!user) {
            response.reply("", response.embedFactory.createInformativeEmbed("Administrators", message.member).setDescription(
                client.config.admins.map(adminID => `• <@${adminID}>`).join("\n")
            ));
        } else {
            if(user == message.author) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You may not remove admin from yourself."));
            if(client.config.admins.includes(user.id)) {
                // User has admin
                let index = client.config.admins.indexOf(user.id);
                client.config.admins.splice(index, 1);
                response.reply("", response.embedFactory.createSuccessEmbed("Set admin", message.member).setDescription("Administrator privileges were successfully removed from the user.").addField("User", user, true));
            } else {
                client.config.admins.push(user.id);
                response.reply("", response.embedFactory.createSuccessEmbed("Set admin", message.member).setDescription("Administrator privileges were successfully added to the user.").addField("User", user, true));
            }
            client.saveConfig();
        }
    }, [], true
);
