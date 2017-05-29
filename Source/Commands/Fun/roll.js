const Command = require("../../Util/Command");

module.exports = new Command("roll", "Roll the dice!", null, ["dice", "diceroll"],
    (client, message, response) => {
        var images = ["http://i.imgur.com/YOvQhls.png", "http://i.imgur.com/3EdL8Fi.png", "http://i.imgur.com/Oi83u55.png", "http://i.imgur.com/LJiKwsA.png", "http://i.imgur.com/z3X8Bi2.png", "http://i.imgur.com/y6ZVWV8.png"]
        var result = Math.floor(Math.random() * 6) + 1;
        response.reply("", response.embedFactory.createInformativeEmbed("Dice Roll").setDescription(`You rolled a ${result}!`).setThumbnail(images[result - 1]), true);
    }, undefined, undefined, true
);