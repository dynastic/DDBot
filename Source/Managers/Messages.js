const Response = require("../Util/Response");
const EmbedFactory = require("../Util/EmbedFactory");

class MessagesManager {
    constructor(client) {
        this.client = client;
        this.embedFactory = new EmbedFactory(this.client);
    }

    isAdmin(user) {
        return this.client.config.admins.includes(user.id);
    }

    handle(message) {
        if (message.channel.type === "dm") return this.client.directMessagesManager.handle(message);

        if (message.author.bot || !message.content.startsWith(this.client.config.prefix) || message.channel.type !== "text") return;
        let isAdmin = this.isAdmin(message.author);

        let args = message.content.split(" ")
        let cstr = args[0].slice(this.client.config.prefix.length);
        args.shift();

        let response = new Response(message);

        this.client.commandsManager.get(cstr).then(command => {
            let selfDestruct = response.getMessageSelfDestructTime(false);
            function doSelfDestruct() {
                if(selfDestruct != null) message.delete(selfDestruct * 1000);
            }

            if (!command) {
                if (!cstr.length) return;
                doSelfDestruct();
                return response.reply("", this.embedFactory.createUnknownCommandEmbed());
            }

            if(this.client.config.isDebugMode || false) console.log(`User ${message.author.username}#${message.author.discriminator} tried to run command with message: ${message.content}`);
            
            if (!command.userCanAccess(message.member)) {
                doSelfDestruct();
                return response.reply("", this.embedFactory.createBadPermsEmbed());
            }
            let res = command.execute(this.client, message, response, args);
            if(res !== true) doSelfDestruct();
        });
    }
}

module.exports = MessagesManager;
