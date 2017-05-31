/*
response.reply("", response.embedFactory.createInformativeEmbed("Module Manager", message.member).setDescription("```---AVAILABLE MODULES---\nco.dynastic.steamboat\nco.dynastic.melania```"))
*/
const Command = require("../../Util/Command");
const Moderation = require("../../Util/Moderation");
const GuildConfig = require("../../Model/guild");

module.exports = new Command("guild", "Guild manager", null, [],
    (client, message, response, args) => {
        var operations = {
            moduleList: function(config) {
                var modules = Array.from(message.client.modulesManager.modules.keys());
                var content = '';
                modules.forEach(identifier => content += `\n\`${identifier}  ${config.disabledModules ? config.disabledModules.includes(identifier) ? "(Disabled)" : "(Enabled)" : "(Enabled)"}\``);
                return response.reply("", response.embedFactory.createInformativeEmbed("Available Modules").setDescription(content));
            }, moduleToggle: function(config) {
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
            }, commandList: function(config) {
                var commands = Array.from(message.client.commandsManager.commands.keys());
                var content = '';
                commands.forEach(command => content += `\n\`${command} ${config.disabledCommands ? config.disabledCommands.includes(identifier) ? "(Disabled)" : "(Enabled)" : "(Enabled)"}\``);
                return response.reply("", response.embedFactory.createInformativeEmbed("Available Commands").setDescription(content));
            }
        }
        
        GuildConfig.findOne({snowflake: message.guild.id}, (err, doc) => {
            if (err || !doc) return response.reply("", respnose.embedFactory.createErrorEmbed().setDescription(`An unknown error occured while validating your request:\n\`\`\`${err}\`\`\``));
            if (doc.delegate != message.author.id && !message.client.config.admins.includes(message.member.id)) return response.reply("", response.embedFactory.createBadPermsEmbed());
            if (!operations[args[0]]) {
                var content = '';
                Object.keys(operations).forEach(command => content += `\n\`.guild ${command}\``);
                return response.reply("", response.embedFactory.createInformativeEmbed("ModuleManager Commands").setDescription(content));
            }
            return operations[args[0]](doc);
        })

    }
);