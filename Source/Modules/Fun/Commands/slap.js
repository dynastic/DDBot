const Command = require("../../../Util/Command");

module.exports = new Command("slap", "Slap the living shit out of a user!", "<user>", ["beat"],
    (client, message, response) => {
        var user = message.mentions.users.first();
        if(!user) return response.reply("", response.embedFactory.createErrorEmbed().setDescription("You did not specify a user to slap."));
        if(user == client.user) return response.reply("", response.embedFactory.createErrorEmbed().setDescription("You don't get to slap me!"));
        var slapMessage = `*${user} was violently slapped by ${message.author}!*`;
        if(user == message.author) {
            slapMessage = `*${user} was violently slapped by themself!*`;
        }
        response.send(slapMessage, null, true);
    }
);