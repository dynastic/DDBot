const Command = require("../../Util/Command");

module.exports = new Command("help", "View a list of commands", "[command]", ["commands", "command"],
    (client, message, response, args) => {
        if(args[0]) {
            var c = args[0].replace("/^" + client.config.prefix + "/", '');
            var command = client.commandsManager.get(c).then(command => {
                if(!command) return response.reply("", response.embedFactory.createUnknownCommandEmbed());
                if(!command.userCanAccess(message.member)) return response.reply("", response.embedFactory.createBadPermsEmbed());
                var embed = response.embedFactory.createInformativeEmbed(`Information about \`${client.config.prefix}${command.command}\``)
                .addField("Description", command.description, true)
                .addField("Usage", `\`${client.config.prefix}${command.command}${command.argumentHints}\``, true);
                if(command.aliases.length > 0) {
                    embed.addField("Alias" + (command.aliases.length == 1 ? "" : "es"), command.aliases.map(alias => `• \`${client.config.prefix}${alias}\``).join("\n"), true);
                }
                return response.reply("", embed, true);
            }).catch(e => client.log(e, true));
        } else {
            var groups = client.commandsManager.groups;
            var newGroups = {};
            Object.keys(groups).forEach(function(key) {
                var list = groups[key];
                var allowedCommands = list.filter(k => {
                    var c = client.commandsManager.data.get(k);
                    return c.userCanAccess(message.member) && k != "help";
                });
                if (allowedCommands.length > 0) newGroups[key] = allowedCommands.map(c => {
                    var command = client.commandsManager.data.get(c);
                    return `• \`${client.config.prefix}${command.command}\``
                }).join("\n");
            })

            var embed = response.embedFactory.createInformativeEmbed("Available Commands");

            Object.keys(newGroups).forEach(key => {
                embed.addField(`${key}:`, newGroups[key], true);
            });
            embed.addField("More information", `Type \`${client.config.prefix}help <command>\` to get more information about a command.`);

            return response.reply("", embed, true);
        }
    }
);
