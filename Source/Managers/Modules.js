const fs = require("fs-extra-promise");
const path = require("path");
const modulesDirectory = path.resolve(`${__dirname.replace(/\/\w+$/, ``)}/Modules/`);

class ModuleManager {
    constructor(client) {
        this.client = client;
        this.modules = new Map();
        this.loadAll();
    }

    load(name, path) {
        return new Promise((resolve, reject) => {
            var newModule = require(path);
            if (!newModule.IDENTIFIER) {
                return reject("A module was skipped because it does not have an identifier.");
            }
            if (this.modules.has(newModule.IDENTIFIER)) {
                return reject("A module with the identifier " + newModule.IDENTIFIER + " already exists.");
            }
            newModule = new newModule(this.client);
            this.modules.set(newModule.IDENTIFIER, newModule);
            resolve(newModule);
        });
    }

    loadAll() {
        var loadCount = 0;
        fs.walk(modulesDirectory).on("data", i => {
            var file = path.parse(i.path);
            if (!file.ext || file.ext !== ".js") return;
            var directory = path.dirname(i.path);
            this.load(file.name, `${file.dir}${path.sep}${file.base}`).catch(e => console.log(e));
            loadCount++;
        }).on("end", () => this.client.log(`Loaded ${loadCount} module${loadCount == 1 ? "" : "s"}!`));
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