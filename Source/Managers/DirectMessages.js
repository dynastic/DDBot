const Response = require("../Util/Response");

class DirectMessagesManager {
    constructor(client) {
        this.client = client;
        this.embedFactory = this.client.embedFactory;
    }

    isAdmin(user) {
        return this.client.config.admins.includes(user.id);
    }

    handle(message) {
        if(message.content == this.client.config.prefix || !message.content.startsWith(this.client.config.prefix) || message.content.startsWith(this.client.config.prefix + this.client.config.prefix) || message.channel.type !== "dm") return;
        var admin = this.client.config.admins.includes(message.author), args = message.content.split(" "), cstr = args[0].slice(this.client.config.prefix.length);
        args.shift();
        var response = new Response(message);
        var command = this.client.commandsManager.get(cstr).then(command => {
            if(!command) {
                if(!cstr.length) return;
                return response.reply("", this.embedFactory.createUnknownCommandEmbed());
            }
            if(!command.supportsDM) {
                return response.reply("", this.embedFactory.createErrorEmbed().setDescription("Sorry! This command is not supported in a DM."));
            }
            if(!command.userCanAccess(message.author, true)) {
                return response.reply("", this.embedFactory.createBadPermsEmbed());
            }
            var res = command.execute(this.client, message, response, args);
        });
    }
}

module.exports = DirectMessagesManager;
