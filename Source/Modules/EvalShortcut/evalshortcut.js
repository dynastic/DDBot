class EvalShortcut {
    constructor(client) {
        this.client = client;
        this.response = this.client.resolve('response');
        if(!this.response) return this.client.log("[EvalShortcut] Disabling because response class could not be found", true)
        this.response = require(this.response);
        this.meta = require('./module')
        this.config = require('./config')
        this.events = {
            message: (message) => {
                if(message.content == this.config.prefix || !message.content.startsWith(this.config.prefix) || message.content.startsWith(this.config.prefix + this.config.prefix)) return;
                this.client.commandsManager.get('eval').then(c => {
                    if(!c) return;
                    var args = message.content.split(" ");
                    args[0] = args[0].slice(this.config.prefix.length);
                    c.execute(this.client, message, new this.response(message), args);
                });
            }
        }
    }
}

module.exports = EvalShortcut;