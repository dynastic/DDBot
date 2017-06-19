const Commands = require('./Commands')
const Messages = require('./Messages')

class GuildInstance {
  constructor (guild) {
    this.guild = guild
    this.client = guild.client
    this.client.getGuildConfig(this.guild).then(prop => {
      this.properties = prop
      this.commandsManager = new Commands(this.client, this.properties.disabledCommands, this.guild)
      this.messagesManager = new Messages(this.guild)
    })
  }
}

module.exports = GuildInstance
