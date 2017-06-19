const Command = require('../../Util/Command')

module.exports = new Command('help', 'View a list of commands', '[command]', ['commands', 'command'],
  (client, message, response, args) => {
    var commandsManager = message.guild ? message.guild.manager.commandsManager : client.commandsManager
    if (args[0]) {
      var c = args[0].replace('/^' + client.config.prefix + '/', '')
      commandsManager.get(c).then(command => {
        if (!command) return response.reply('', response.embedFactory.createUnknownCommandEmbed())
        if (message.channel.type === 'text' ? !command.userCanAccess(message.member) : !command.userCanAccess(message.author, true)) return response.reply('', response.embedFactory.createBadPermsEmbed())
        var embed = response.embedFactory.createInformativeEmbed(`Information about \`${client.config.prefix}${command.command}\``)
          .addField('Description', command.description, true)
          .addField('Usage', `\`${client.config.prefix}${command.command}${command.argumentHints}\``, true)
        if (command.aliases.length > 0) {
          embed.addField('Alias' + (command.aliases.length === 1 ? '' : 'es'), command.aliases.map(alias => `• \`${client.config.prefix}${alias}\``).join('\n'), true)
        }
        return response.reply('', embed, true)
      }).catch(e => client.log(e, true))
    } else {
      var groups = Object.assign({}, commandsManager.groups)
      var moduleCommands = client.modulesManager.commandGroups
      Object.keys(moduleCommands).forEach(identifier => {
        if (message.guild && message.guild.manager.properties.disabledModules && message.guild.manager.properties.disabledModules.includes(identifier)) return
        var meta = client.modulesManager.moduleMetas[identifier]
        var tag = meta.commands.group ? meta.commands.group : meta.name ? meta.name : 'Utilities'
        if (groups[tag]) {
          groups[tag] = groups[tag].concat(moduleCommands[identifier])
          return
        }
        groups[tag] = moduleCommands[identifier]
      })
      var newGroups = {}
      Object.keys(groups).forEach(function (key) {
        var list = groups[key]
        var allowedCommands = list.filter(k => {
          var c = commandsManager.getSync(k)
          var dmSense = message.channel.type === 'dm' ? c.supportsDM : true
          return c.userCanAccess(message.channel.type === 'dm' ? message.author : message.member, message.channel.type === 'dm') && k !== 'help' && dmSense
        })
        if (allowedCommands.length > 0) {
          newGroups[key] = allowedCommands.map(c => {
            var command = commandsManager.getSync(c)
            return `• \`${client.config.prefix}${command.command}\``
          }).join('\n')
        }
      })

      var embed = response.embedFactory.createInformativeEmbed('Available Commands')

      Object.keys(newGroups).sort().forEach(key => {
        embed.addField(`${key}:`, newGroups[key], true)
      })
      embed.addField('More information', `Type \`${client.config.prefix}help <command>\` to get more information about a command.`)

      return response.reply('', embed, true)
    }
  }, [], false, true
)
