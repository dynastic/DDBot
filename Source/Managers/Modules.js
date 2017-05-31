const fs = require("fs-extra-promise");
const path = require("path");
const modulesDirectory = path.resolve(`${__dirname.replace(/\/\w+$/, ``)}/Modules/`);

class ModuleManager {
    constructor(client) {
        this.client = client;
        this.modules = new Map();
        this.commands = {};
        this.commandAliases = {};
        this.commandGroups = {};
        this.moduleMetas = {};
        this.loadAll();
    }

    load(name, path) {
        return new Promise((resolve, reject) => {
            var newModule = require(path);
            if (this.modules.has(name)) {
                return reject("A module with the identifier " + name + " already exists.");
            }
            newModule = new newModule(this.client);
            this.modules.set(name, newModule);
            resolve(newModule);
        });
    }

    loadAll() {
        fs.readdir(modulesDirectory, (err, files) => {
            if(err) return this.client.log(err, true);
            files.forEach((file, index) => {
                fs.stat(modulesDirectory + path.sep + file, (e, s) => {
                    if(e) return this.client.log(e, true);
                    if(!s.isDirectory()) return;
                    var folder = path.parse(modulesDirectory + path.sep + file);
                    var nicePath = folder.dir + path.sep + folder.base + path.sep;
                    fs.stat(nicePath + "module.json", err => {
                        if(err) return this.client.log("Skipping malformed module " + folder.name + " (231)");
                        var moduleMeta = require(nicePath + "module.json");
                        if(!moduleMeta.main) return this.client.log("Skipping malformed module " + folder.name + " (739)");
                        if(!moduleMeta.identifier) return this.client.log("Skipping malformed module " + folder.name + " (451)");
                        fs.stat(nicePath + moduleMeta.main, err => {
                            if(err) return;
                            this.load(moduleMeta.identifier, nicePath + moduleMeta.main).catch(e => this.client.log(e, true));
                            this.moduleMetas[moduleMeta.identifier] = moduleMeta;
                        })
                        fs.stat(nicePath + moduleMeta.commands.directory, (e, s) => {
                            if(e) return;
                            if(!s.isDirectory()) return this.client.log("Commands field must be a folder in module " + folder.name);
                            fs.readdir(nicePath + moduleMeta.commands.directory, (cmdErr, cmdFiles) => {
                                if(cmdErr) return this.client.log(cmdErr);
                                cmdFiles.forEach(cmdFile => {
                                    var cmdResolved = path.parse(nicePath + moduleMeta.commands.directory + path.sep + cmdFile);
                                    var commandMeta = {
                                        module: moduleMeta.identifier,
                                        group: moduleMeta.commands.group ? moduleMeta.commands.group : moduleMeta.name,
                                        command: require(nicePath + moduleMeta.commands.directory + path.sep + cmdFile)
                                    };
                                    this.commands[cmdResolved.name] = commandMeta;
                                    commandMeta.command.aliases.forEach(alias => this.commandAliases[alias] = commandMeta);
                                    if (!this.commandGroups[this.commands[cmdResolved.name].module]) this.commandGroups[this.commands[cmdResolved.name].module] = [];
                                    this.commandGroups[this.commands[cmdResolved.name].module].push(this.commands[cmdResolved.name].command.command);
                                })
                            })
                        })
                    })
                })
            });
        });
    }

    reload(input) {
        return new Promise((resolve, reject) => {
            if (!this.data.has(input)) return reject("Invalid Command");
            this.load(input, this.data.get(input).path);
            resolve();
        });
    }

    get(input) {
        input = input.toLowerCase();
        return new Promise((resolve, reject) => {
            if (this.data.has(input)) return resolve(this.data.get(input));
            reject();
        })
    }
}

module.exports = ModuleManager;