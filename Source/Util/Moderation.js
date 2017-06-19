const Discord = require('discord.js')

module.exports = class Moderation {
  constructor (client) {
    this.client = client
  }

  stringLooselyMatchesUser (str, user) {
    if (str == user.id || str == user) return true
    if (str.replace('/^@/', '') == user.username) return true
    if (str.replace('/^@/', '') == user.username + '#' + user.discriminator) return true
    return false
  }

  validateUserArgument (mention, argument) {
    return mention && argument && this.validateUserText(argument)
  }

  validateUserText (argument) {
    return argument.match(/<@[!0-9]+>/g)
  }

  userCanPerformActionError (performingMember, actionUser, guild) {
      // Checks if the performingUser is allowed to perform the action (e.g. kick, ban) on the actionUser (is the user a higher role) (returns null if can perform, returns message if can't)
    var botMember = guild.members.get(guild.client.user.id)
    var actionMember = guild.members.get(actionUser.id)
    if (!actionMember) return 'The user you attempted to perform the action on is not in the server.'
    if (actionMember.user == this.client.user) return "You can't make me do that to myself!"
    if (Discord.Role.comparePositions(botMember.highestRole, actionMember.highestRole) <= 0/* && botMember != actionMember */) return 'You cannot perform that action on that user because I am not of a higher role than them.'
    if (Discord.Role.comparePositions(performingMember.highestRole, actionMember.highestRole) <= 0 && performingMember != actionMember) return "You can't perform actions on someone with a higher or the same higher highest role than you."
    return actionMember
  }
}
