const Discord = require('discord.js')
const Command = require('../../../Util/Command')
const Moderation = require('../../../Util/Moderation')
const Case = require('../../../Model/case')

module.exports = new Command('mute', 'Mute/unmutes a user', '<user>', ['muteuser', 'unmute', 'unmuteuser', 'togglemute', 'setmute'],
    (client, message, response, args) => {
      var modUtils = new Moderation(client), user = message.mentions.users.first(), muteRole = client.getMuteRoleForGuild(message.guild)
      var doMute = (muteRole) => {
        var member = modUtils.userCanPerformActionError(message.member, user, message.guild)
        if (typeof member === 'string') return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription(member))

        if (member.roles.array().includes(muteRole)) {
                // User has role
          Case.createCase(message.author, 'unmute', user, message.guild).then(newCase => {
            member.removeRole(muteRole).then(member => {
              response.reply('', response.embedFactory.createSuccessEmbed('Unmuted user', message.member).setDescription('The specified user was successfully unmuted.').addField('User', user, true).addField('Case', `#${newCase.number.toLocaleString()}`, true))
            }).catch(err => {
              client.log(err, true)
              response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('An unknown error occurred while trying to unmute the user.'))
            })
          }).catch(err => response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('An unknown error occurred while trying to unmute the user.')))
        } else {
          Case.createCase(message.author, 'mute', user, message.guild).then(newCase => {
            member.addRole(muteRole).then(member => {
              response.reply('', response.embedFactory.createSuccessEmbed('Muted user', message.member).setDescription('The specified user was successfully muted.').addField('User', user, true).addField('Case', `#${newCase.number.toLocaleString()}`, true))
            }).catch(err => {
              client.log(err, true)
              response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('An unknown error occurred while trying to mute the user.'))
            })
          }).catch(err => response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('An unknown error occurred while trying to mute the user.')))
        }
      }

      if (user == message.author) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('You may not mute yourself.'))
      if (!user) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('You did not specify a user.'))

      if (!muteRole) {
        client.createMutedRole(message.guild).then(guild => {
          muteRole = client.getMuteRoleForGuild(message.guild)
          if (!muteRole) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('Could not find the mute role. Please ensure that the bot is allowed to manage roles on this guild.'))
          doMute(muteRole)
        }).catch(e => client.log(e, true))
      } else {
        doMute(muteRole)
      }
    }, ['MANAGE_ROLES_OR_PERMISSIONS']
)
