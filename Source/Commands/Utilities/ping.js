const Command = require("../../Util/Command");

module.exports = new Command("ping", "Pong!", null, ["pong", "test"],
    (client, message, response) => {
        response.reply("", response.embedFactory.createInformativeEmbed("Pinging...").setDescription("Please wait..."), true).then(msg => {
            response.edit(msg, msg.content, response.embedFactory.createSuccessEmbed("Pong!").setDescription(`Took ${msg.createdTimestamp - message.createdTimestamp}ms.`));
        }).catch(e => client.log(e, true));
    }
);
