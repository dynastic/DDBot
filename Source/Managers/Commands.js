const fs = require("fs-extra-promise");
const path = require("path");
const commands = path.resolve(`${__dirname.replace(/\/\w+$/, ``)}/Commands/`);

class CommandsManager {
    constructor(client, disabledCommands) {
        this.client = client;

        this.groups = {};
        this.data = new Map();

        this.disabledCommands = disabledCommands || [];

        this.loadAll();
    }

    load(name, groupName, path) {
        if(this.disabledCommands.includes(name)) return;
        var command = require(path);
        if (this.data.has(command.command)) {
            delete require.cache[require.resolve(path)];
        }
        this.data.set(command.command, command);
        if(!this.groups[groupName]) {
            this.groups[groupName] = [];
        }
        this.groups[groupName].push(command.command);
    }

    loadAll() {
        var client = this.client;
        fs.walk(commands).on("data", item => {
            var file = path.parse(item.path);
            if (!file.ext || file.ext !== ".js") return;
            var dirPath = path.dirname(item.path);
            var groupName = dirPath == commands ? "Other" : path.basename(dirPath);
            this.load(file.name, groupName, `${file.dir}${path.sep}${file.base}`);
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
            if (this.data.has(text)) return resolve(this.data.get(text));
            this.data.forEach(c => {
                if (c.aliases && c.aliases.includes(text)) return resolve(c);
            });
            return resolve();
        });
    }
}

module.exports = CommandsManager;