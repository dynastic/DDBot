const Command = require('../../../Util/Command')
const Case = require('../../../Model/case')

module.exports = new Command('case', 'View a moderator action case', '<case number>', ['viewcase', 'caselookup', 'lookupcase', 'cl', 'vc', 'caseinfo', 'viewaction', 'actionlookup'],
  (client, message, response, args) => {
    if (!args[0]) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('You did not specify the number of the case to view.'))
    Case.findOne({number: args[0], guildID: message.guild.id}).then(foundCase => {
      if (!foundCase) return response.reply('', response.embedFactory.createErrorEmbed("Couldn't find case", message.member).setDescription('A case with the specified number could not be found for this server.'))
      var embed = response.embedFactory.createInformativeEmbed(`Case #${foundCase.number}`, message.member)
        .setDescription(`Case #${foundCase.number} was an action of type **${foundCase.type}**.`)
        .addField('User', `<@${foundCase.userID}>`, true)
        .addField('Moderator', `<@${foundCase.modID}>`, true)
      if (['warn', 'liftwarn'].includes(foundCase.type)) embed.addField('Points given', foundCase.points.toLocaleString() || 0, true)
      if (['ban', 'kick', 'warn'].includes(foundCase.type)) embed.addField('Reason', foundCase.reason || '*None provided*', true)
      response.reply('', embed, true)
    }).catch(err => {
      client.log(err, true)
      response.reply('', response.embedFactory.createErrorEmbed("Couldn't find case", message.member).setDescription(`A case with the specified number could not be found for this server.`))
    })
  }, ['MANAGE_GUILD']
)
