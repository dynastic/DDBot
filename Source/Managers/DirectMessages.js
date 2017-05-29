const Response = require("../Util/Response");

class DirectMessagesManager {
    constructor(client) {
        this.client = client;
    }

    handle(message) {
        if (message.author.bot) return;

        var response = new Response(message);
    }
}

module.exports = DirectMessagesManager;
