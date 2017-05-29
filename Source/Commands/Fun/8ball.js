const Command = require("../../Util/Command");

module.exports = new Command("8ball", "Ask the Magic 8-Ball!", null, ["magic8ball", "eightball", "8-ball"],
    (client, message, response, args) => {
        let responses = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
        let embed = response.embedFactory.createInformativeEmbed("8-Ball says").setDescription(`${responses[Math.floor(Math.random() * responses.length)]}`);
        if(args[0]) embed.addField("In response to", args.join(" "));
        response.reply("", embed, true);
    }
);