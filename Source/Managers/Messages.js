const Response = require('../Util/Response')

class MessagesManager {
  constructor (guild) {
    this.guild = guild
    this.client = guild.client
  }

  isAdmin (user) {
    return this.client.config.admins.includes(user.id)
  }

  handle (message) {
    if (message.content == this.client.config.prefix || !message.content.startsWith(this.client.config.prefix) || message.content.startsWith(this.client.config.prefix + this.client.config.prefix) || message.channel.type !== 'text') return
    var isAdmin = this.isAdmin(message.author)

    var args = message.content.split(' ')
    var cstr = args[0].slice(this.client.config.prefix.length)
    args.shift()

    var response = new Response(message)

    this.guild.manager.commandsManager.get(cstr).then(command => {
      var selfDestruct = response.getMessageSelfDestructTime(false)
      function doSelfDestruct () {
        if (selfDestruct != null) message.delete(selfDestruct * 1000)
      }

      if (!command) {
        if (!cstr.length) return
        doSelfDestruct()
        return response.reply('', this.client.embedFactory.createUnknownCommandEmbed())
      }

      if (this.client.config.isDebugMode || false) this.client.log(`User ${message.author.username}#${message.author.discriminator} tried to run command with message: ${message.content}`)

      if (!command.userCanAccess(message.member)) {
        doSelfDestruct()
        return response.reply('', this.client.embedFactory.createBadPermsEmbed())
      }
      var res = command.execute(this.client, message, response, args)
      if (res !== true) doSelfDestruct()
    }).catch(e => this.client.log(e, true))
  }
}

module.exports = MessagesManager
