const Response = require("../Util/Response");

class DirectMessagesManager {
    constructor(client) {
        this.client = client;
    }

    handle(message) {
        if (message.author.bot) return;

        let response = new Response(message);
    }
}

module.exports = DirectMessagesManager;
