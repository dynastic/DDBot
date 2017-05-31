const Command = require("../../../Util/Command");
const Moderation = require("../../../Util/Moderation");

module.exports = new Command("purge", "Deletes the latest messages in the channel", "[count:10]", ["prune", "clean"],
    (client, message, response, args) => {
        var count = args[0] || 10;
        if(isNaN(count)) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("Please enter a numeric amount."));
        count = parseInt(count);
        if(count < 2 || count >= 100) return response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("The amount of messages to purge must be at least 2 and fewer than 100."));
        var origMessage = message;
        message.channel.fetchMessages({limit: count}).then(messages => {
            response.reply("", response.embedFactory.createInformativeEmbed("Purge in progress...", origMessage.member).setDescription(`Purging the latest ${messages.size} message${messages.size == 1 ? "" : "s"} (including the command).`), true).then(message => {
                message.channel.bulkDelete(messages).then(messages => {
                    response.edit(message, message.content, response.embedFactory.createSuccessEmbed(null, origMessage.member).setDescription(`Successfully purged the latest ${messages.size} message${messages.size == 1 ? "" : "s"}!`));
                }).catch(err => {
                    client.log(err, true);
                    response.edit(message, message.content, response.embedFactory.createErrorEmbed(null, origMessage.member).setDescription("An unknown error occurred while trying to purge messages."));
                });
            }).catch(e => client.log(e, true));
        }).catch(err => {
            client.log(err, true);
            response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to purge messages."));
        })
    }, ["MANAGE_MESSAGES"]
);