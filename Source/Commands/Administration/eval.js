const Command = require("../../Util/Command");
const util = require("util");

module.exports = new Command("eval", "Run code on the bot", "<code>", [],
    (client, message, response, args) => {
        var code = args.join(" ");
        try {
            var output = eval(code);

            output instanceof Promise ?
                output.then(a => {
                    response.reply("", response.embedFactory.createSuccessEmbed("Promise Resolved", message.member).setDescription(`\`\`\`js\n${util.inspect(a, { depth: 0 })}\n\`\`\``), true).catch(err => {
                        response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(`\`\`\`\n${err.stack}\n\`\`\``), true);
                    });
                }).catch(err => {
                  response.reply("", response.embedFactory.createErrorEmbed("Promise Rejected", message.member).setDescription(`\`\`\`\n${err.stack}\n\`\`\``), true);
                }) :
                output instanceof Object ?
                  response.reply("", response.embedFactory.createSuccessEmbed("Result", message.member).setDescription(`\`\`\`js\n${util.inspect(output, { depth: 0 })}\n\`\`\``), true) :
                  response.reply("", response.embedFactory.createSuccessEmbed("Result", message.member).setDescription(`\`\`\`\n${output}\n\`\`\``), true);
        } catch (err) {
            response.reply("", response.embedFactory.createErrorEmbed(null, message.member).setDescription(`\`\`\`\n${err.stack}\n\`\`\``), true);
        }
        return true;
    }, [], true, true
);
