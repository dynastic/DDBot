const Discord = require('discord.js')
const Command = require('../../../Util/Command')
const Moderation = require('../../../Util/Moderation')

module.exports = new Command('assignrole', 'Toggle a role on a user', '<user> <role>', ['role', 'setrole', 'changerole', 'managerole', 'togglerole', 'addrole', 'removerole', 'remrole', 'rmrole', 'delrole', 'deleterole'],
  (client, message, response, args) => {
    var modUtils = new Moderation(client), user = message.mentions.users.first(), role = message.mentions.roles.first()

    if (!user || !role) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('You did not specify both a user and a role.'))

    var member = modUtils.userCanPerformActionError(message.member, user, message.guild)
    if (typeof member === 'string') return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription(member))

    if (Discord.Role.comparePositions(message.member.highestRole, role) <= 0 && user !== message.author) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription("You can't perform actions with a role higher than your highest role."))

    if (member.roles.array().includes(role)) {
      // User has role
      member.removeRole(role).then(member => {
        response.reply('', response.embedFactory.createSuccessEmbed('Set role', message.member).setDescription('The specified role was successfully removed from the user.').addField('User', user, true).addField('Role', role, true))
      }).catch(err => {
        client.log(err, true)
        response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription(`An unknown error occurred while trying to remove the user's role.`))
      })
    } else {
      member.addRole(role).then(member => {
        response.reply('', response.embedFactory.createSuccessEmbed('Set role', message.member).setDescription('The specified role was successfully added to the user.').addField('User', user, true).addField('Role', role, true))
      }).catch(err => {
        client.log(err, true)
        response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription("An unknown error occurred while trying to add the user's role."))
      })
    }
  }, ['MANAGE_ROLES_OR_PERMISSIONS']
)
