const fs = require("fs-extra-promise");
const path = require("path");
const commands = path.resolve(`${__dirname.replace(/\/\w+$/, ``)}/Commands/`);

class CommandsManager {
    constructor(client, disabledCommands, guild = null) {
        this.client = client;

        this.groups = {};
        this.data = new Map();
        this.guild = guild;

        this.loadAll();
    }

    load(groupName, path) {
        var command = require(path);
        if (this.data.has(command.command)) delete require.cache[require.resolve(path)];
        this.data.set(command.command, command);
        if(!this.groups[groupName]) this.groups[groupName] = [];
        this.groups[groupName].push(command.command);
    }

    loadAll() {
        var client = this.client;
        fs.walk(commands).on("data", item => {
            var file = path.parse(item.path);
            if (!file.ext || file.ext !== ".js") return;
            var dirPath = path.dirname(item.path);
            var groupName = dirPath == commands ? "Other" : path.basename(dirPath);
            this.load(groupName, `${file.dir}${path.sep}${file.base}`);
        })
        return this;
    }

    reload(input) {
        return new Promise((resolve, reject) => {
            if (!this.data.has(input)) return reject("Invalid Command");
            var command = this.data.get(input);
            this.load(input, command.path);
        });
    }

    get(text) {
        text = text.toLowerCase();
        return new Promise((resolve, reject) => {
            if (this.guild && this.guild.manager.properties.disabledCommands && this.guild.manager.properties.disabledCommands.includes(text)) return resolve(); 
            if (this.data.has(text)) return resolve(this.data.get(text));
            this.data.forEach(c => {
                if (c.aliases && c.aliases.includes(text)) return resolve(c);
            });
            var moduleCommands = this.client.modulesManager.commands;
            var moduleCommandsKeys = Object.keys(moduleCommands);
            var commandIndex = moduleCommandsKeys.indexOf(text);
            if (commandIndex > -1) {
                var command = moduleCommands[text];
                if (!this.guild) return resolve(command.command);
                if (this.guild.manager.properties.disabledModules.indexOf(command.module) > -1) return resolve();
                return resolve(command.command);
            }
            return resolve();
        });
    }

    getSync(text) {
        text = text.toLowerCase();
        if (this.guild && this.guild.manager.properties.disabledCommands && this.guild.manager.properties.disabledCommands.includes(text)) return null; 
        if (this.data.has(text)) return this.data.get(text);
        this.data.forEach(c => {
            if (c.aliases && c.aliases.includes(text)) return c;
        });
        var moduleCommands = this.client.modulesManager.commands;
        var moduleCommandsKeys = Object.keys(moduleCommands);
        var commandIndex = moduleCommandsKeys.indexOf(text);
        if (commandIndex > -1) {
            var command = moduleCommands[text];
            if (!this.guild) return command.command;
            if (this.guild.manager.properties.disabledModules.indexOf(command.module) > -1) return null;
            return command.command;
        }
        var moduleAliasCommands = this.client.modulesManager.commandAliases;
        var moduleAliasCommandsKeys = Object.keys(moduleAliasCommands);
        var aliasCommandIndex = moduleAliasCommandsKeys.indexOf(text);
        if (aliasCommandIndex > -1) {
            var command = moduleCommands[text];
            if (!this.guild) return command.command;
            if (this.guild.manager.properties.disabledModules.indexOf(command.module) > -1) return null;
            return command.command;
        }
        return null;
    }
}

module.exports = CommandsManager;