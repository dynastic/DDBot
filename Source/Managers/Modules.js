const fs = require("fs-extra-promise");
const path = require("path");
const modulesDirectory = path.resolve(`${__dirname.replace(/\/\w+$/, ``)}/Modules/`);

class ModuleManager {
    constructor(client, commandsManager) {
        this.client = client;
        this.modules = new Map();
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
        var loadCount = 0;
        fs.readdir(modulesDirectory, (err, files) => {
            if(err) return console.error(err);
            files.forEach((file, index) => {
                fs.stat(modulesDirectory + path.sep + file, (e, s) => {
                    if(e) return console.error(e);
                    if(!s.isDirectory()) return;
                    var folder = path.parse(modulesDirectory + path.sep + file);
                    var nicePath = folder.dir + path.sep + folder.base + path.sep;
                    fs.exists(nicePath + "module.json", metaExists => {
                        if(!metaExists) return console.error("Skipping malformed module " + folder.name + " (231)");
                        var moduleMeta = require(nicePath + "module.json");
                        if(!moduleMeta.main) return console.error("Skipping malformed module " + folder.name + " (739)");
                        if(!moduleMeta.identifier) return console.error("Skipping malformed module " + folder.name + " (451)");
                        fs.exists(nicePath + moduleMeta.main, mainExists => {
                            if(!mainExists) return console.error("Skipping malformed module " + folder.name + " (379)");
                            this.load(moduleMeta.identifier, nicePath + moduleMeta.main).catch(e => console.log(e));
                            loadCount++;
                        })
                        fs.exists(nicePath + moduleMeta.commands.directory, commandsExists => {
                            if(!commandsExists) return console.error("Not loading commands for " + folder.name + " (845)");
                            fs.stat(nicePath + moduleMeta.commands.directory, (e, s) => {
                                if(e) return console.error(e);
                                if(!s.isDirectory()) return console.error("Commands field must be a folder in module " + folder.name);
                                fs.readdir(nicePath + moduleMeta.commands.directory, (cmdErr, cmdFiles) => {
                                    if(cmdErr) return console.error(cmdErr);
                                    cmdFiles.forEach(cmdFile => {
                                        var cmdResolved = path.parse(nicePath + moduleMeta.commands.directory + path.sep + cmdFile);
                                        this.client.commandsManager.load(cmdFile, moduleMeta.commands.group ? moduleMeta.commands.group : moduleMeta.name, nicePath + moduleMeta.commands.directory + path.sep + cmdFile)
                                    })
                                })
                            })
                        })
                    })
                })
            });
        })
        return this;
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