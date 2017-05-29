const Command = require("../../Util/Command");

module.exports = new Command("setstatus", "Set the bot's status", "<new status>", ["setgame"],
    (client, message, response, args) => {
        if(!args[0]) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("You did not specify a status to set to."));
        let newStatus = args.join(" ");
        client.config.status = newStatus;
        client.saveConfig();
        client.setStatusFromConfig().then(user => {
            response.reply("", response.embedFactory.createSuccessEmbed(null, message.member).setDescription(`Successfully set status to *${newStatus}*`));
        }).catch(err => {
            client.log(err, true);
        });
    }, [], true
);
