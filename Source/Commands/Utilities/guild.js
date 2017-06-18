/*
response.reply("", response.embedFactory.createInformativeEmbed("Module Manager", message.member).setDescription("```---AVAILABLE MODULES---\nco.dynastic.steamboat\nco.dynastic.melania```"))
*/
const Command = require("../../Util/Command");
const Moderation = require("../../Util/Moderation");
const GuildConfig = require("../../Model/guild");

module.exports = new Command("guild", "Guild manager", null, [],
    (client, message, response, args) => {
        var operations = {
            moduleList(config) {
                var modules = Array.from(message.client.modulesManager.modules.keys());
                var content = '';
                modules.forEach(identifier => content += `\n\`${identifier}  ${config.disabledModules ? config.disabledModules.includes(identifier) ? "(Disabled)" : "(Enabled)" : "(Enabled)"}\``);
                return response.reply("", response.embedFactory.createInformativeEmbed("Available Modules").setDescription(content));
            }, moduleToggle(config) {
                if(!args[1]) return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`Usage: \`${client.config.prefx}guild moduleToggle <module ID>\``));
                var modIdentifier = args[1].toLowerCase();
                var modules = Array.from(message.client.modulesManager.modules.keys());
                var wildcard = args[1] == '*';
                if(!modules.includes(modIdentifier) && !wildcard) return response.reply("", response.embedFactory.createErrorEmbed("Invalid Module").setDescription(`\`${modIdentifier}\` is not a valid module.\nRun \`.modules list\` for a list of valid modules.`));
                var modulesAffected = wildcard ? modules : [modIdentifier];
                var content = '';
                modulesAffected.forEach(identifier => {
                    var enabling = config.disabledModules ? config.disabledModules.includes(identifier) : false;
                    if (enabling) {
                        config.disabledModules.splice(config.disabledModules.indexOf(identifier), 1);
                    } else {
                        config.disabledModules.push(identifier);
                    }
                    message.guild.manager.properties = config;
                    content += `\nSuccessfully ${enabling ? "enabled" : "disabled"} \`${identifier}\``;
                });
                config.save();
                message.guild.manager.properties = config;
                return response.reply("", response.embedFactory.createSuccessEmbed().setTitle("Output").setDescription(content));
            }, commandList(config) {
                var commands = Array.from(message.guild.manager.commandsManager.data.keys());
                var content = [];

                Object.keys(client.modulesManager.commands).forEach(index => {
                    var commandName = client.modulesManager.commands[index].command.command;
                    var moduleDisabled = config.disabledModules ? config.disabledModules.includes(client.modulesManager.commands[index].module) : false;
                    var commandDisabled = config.disabledCommands ? config.disabledCommands.includes(commandName) : false;
                    var status = moduleDisabled ? "(Disabled)" : commandDisabled ? "(Disabled)" : "(Enabled)";
                    content.push(`\`${client.config.prefix}${commandName} [${client.modulesManager.commands[index].module}] ${status}\``);
                });
                commands.forEach(command => {
                    content.push(`\`${client.config.prefix}${command} ${config.disabledCommands ? config.disabledCommands.includes(command) ? "(Disabled)" : "(Enabled)" : "Enabled"}\``);
                })
                content.sort();
                var contentPrepped = content.join("\n");
                if(contentPrepped.length > 2048) return response.reply("", response.embedFactory.createErrorEmbed().setDescription('This guild has too many commands! Contact the bot admins for a list of commands.'));
                //commands.forEach(command => content += `\n\`${command} ${config.disabledCommands ? config.disabledCommands.includes(command) ? "(Disabled)" : config.disabledModules ? config.disabledModules.includes()}\``);
                return response.reply("", response.embedFactory.createInformativeEmbed("Available Commands").setDescription(contentPrepped), true);
            }, commandToggle(config) {
                if(!args[1]) return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`Usage: \`${client.config.prefix}commandToggle <command>\``))
                var command = args[1].toLowerCase().trim();
                if (command == "guild") return response.reply("", response.embedFactory.createErrorEmbed().setDescription(`You cannot disable the guild command, how would you re-enable it?`));
                var enabling = config.disabledCommands ? config.disabledCommands.includes(command) : false;
                if (enabling) {
                    config.disabledCommands.splice(config.disabledCommands.indexOf(command), 1);
                    config.save();
                    message.guild.manager.properties = config;
                } else {
                    config.disabledCommands.push(command);
                    config.save();
                    message.guild.manager.properties = config;
                }
                return response.reply("", response.embedFactory.createSuccessEmbed().setDescription(`Successfully ${enabling ? "enabled" : "disabled"} \`${client.config.prefix}${command}\``));
            }
        }
        
        GuildConfig.findOne({snowflake: message.guild.id}, (err, doc) => {
            if (err || !doc) return response.reply("", respnose.embedFactory.createErrorEmbed().setDescription(`An unknown error occured while validating your request:\n\`\`\`${err}\`\`\``));
            if (doc.delegate != message.author.id && !message.client.config.admins.includes(message.member.id)) return response.reply("", response.embedFactory.createBadPermsEmbed());
            if (!operations[args[0]]) {
                var content = '';
                Object.keys(operations).forEach(command => content += `\n\`${client.config.prefix}guild ${command}\``);
                return response.reply("", response.embedFactory.createInformativeEmbed("ModuleManager Commands").setDescription(content));
            }
            return operations[args[0]](doc);
        })

    }
);