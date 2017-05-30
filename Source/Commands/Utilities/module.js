/*
response.reply("", response.embedFactory.createInformativeEmbed("Module Manager", message.member).setDescription("```---AVAILABLE MODULES---\nco.dynastic.steamboat\nco.dynastic.melania```"))
*/
const Command = require("../../Util/Command");
const Moderation = require("../../Util/Moderation");
const GuildConfig = require("../../Model/guild");

module.exports = new Command("modules", "A module manager", null, [],
    (client, message, response, args) => {
        var operations = {
            list: function(config) {
                var modules = Array.from(message.client.modulesManager.modules.keys());
                var content = '```--- AVAILABLE MODULES ---';
                
                modules.forEach(identifier => content += `\n${identifier}  ${config.disabledModules ? config.disabledModules.includes(identifier) ? "(DISABLED)" : "(ENABLED)" : "(ENABLED)"}`);
                content += '\n--- AVAILABLE MODULES ---```';
                return response.reply("", response.embedFactory.createInformativeEmbed("Available Modules").setDescription(content));
            }, toggle: function(config) {
                var identifier = args[1].toLowerCase();
                var modules = Array.from(message.client.modulesManager.modules.keys());
                if(!modules.includes(identifier)) return response.reply("", response.embedFactory.createErrorEmbed("Invalid Module").setDescription(`\`${identifier}\` is not a valid module.\nRun \`.modules list\` for a list of valid modules.`));
                var enabling = config.disabledModules ? config.disabledModules.includes(identifier) : false;
                if (enabling) {
                    config.disabledModules.splice(config.disabledModules.indexOf(identifier), 1);
                    config.save();
                    message.guild.manager.properties = config;
                } else {
                    config.disabledModules.push(identifier);
                    config.save();
                    message.guild.manager.properties = config;
                }
                return response.reply("", response.embedFactory.createSuccessEmbed().setDescription(`Successfully ${enabling ? "enabled" : "disabled"} ${identifier}`));
            }
        }
        
        GuildConfig.findOne({snowflake: message.guild.id}, (err, doc) => {
            if (err || !doc) return response.reply("", respnose.embedFactory.createErrorEmbed().setDescription(`An unknown error occured while validating your request:\n\`\`\`${err}\`\`\``));
            if (doc.delegate != message.author.id && !message.client.config.admins.includes(message.member.id)) return response.reply("", response.embedFactory.createBadPermsEmbed());
            if (!operations[args[0]]) {
                var content = '```--- Unknown command, here is a list of commands. ---';
                Object.keys(operations).forEach(command => content += `\n.modules ${command}`);
                content += "```";
                return response.reply("", response.embedFactory.createInformativeEmbed("Module Help").setDescription(content));
            }
            return operations[args[0]](doc);
        })

    }
);