const fs = require("fs-extra-promise");
const path = require("path");
const commands = path.resolve(`${__dirname.replace(/\/\w+$/, ``)}/Commands/`);

class CommandsManager {
    constructor(client) {
        this.client = client;

        this.groups = {};
        this.data = new Map();

        this.loadAll();
    }

    load(name, groupName, path) {
        let command = require(path);
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
        var loadCount = 0;
        var client = this.client;
        fs.walk(commands).on("data", item => {
            let file = path.parse(item.path);
            if (!file.ext || file.ext !== ".js") return;
            let dirPath = path.dirname(item.path);
            let groupName = dirPath == commands ? "Other" : path.basename(dirPath);
            this.load(file.name, groupName, `${file.dir}${path.sep}${file.base}`);

            loadCount += 1;
        }).on('end', function() {
          client.log(`Loaded ${loadCount} command${loadCount == 1 ? "" : "s"}!`);
        });
        return this;
    }

    reload(input) {
        return new Promise((resolve, reject) => {
            if (!this.data.has(input)) return reject("Invalid Command");
            let command = this.data.get(input);
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