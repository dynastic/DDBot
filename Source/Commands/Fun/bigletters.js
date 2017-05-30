const Command = require("../../Util/Command");

module.exports = new Command("bigletters", "Turn a boring string of text into beautiful emoji letters", "<text>", ["bl", "emojiletters", "bigletter", "emojiletter"],
    (client, message, response, args) => {
        var text = message.cleanContent.split(" ").splice(1).join(" ");
        if(!args[0]) return response.reply("", response.embedFactory.createErrorEmbed().setDescription("You did not enter a message to turn into emoji letters."));
        var newText = client.input.emojify(text);
        if(!newText || newText == "") return response.reply("", response.embedFactory.createErrorEmbed().setDescription("The text you entered was not long enough to form an emoji sentence."));
        return response.reply(newText, null, true);
    }, [], false, true
);
