const Commands = require("./Commands");
const Messages = require("./Messages");

class GuildInstance {
    constructor(guild) {
        this.guild = guild;
        this.client = guild.client;
        this.properties = this.client.getGuildConfig(guild);
        if(this.properties.disabledCommands.length == 0){
            this.commandsManager = this.client.commandsManager;
        } else {
            this.commandsManager = new Commands(this.client, this.properties.disabledCommands);
        }
        this.messagesManager = new Messages(this.guild);
    }
}

module.exports = GuildInstance;