class Command {
  constructor (command, description, argumentHints, aliases, execute, requiredPermissions, requiresAdmin, supportsDM = false) {
    this.command = command

    this.description = description

    this.argumentHints = argumentHints ? ' ' + argumentHints : ''

    this.aliases = aliases

    this.execute = execute

    this.requiredPermissions = requiredPermissions || []

    this.requiresAdmin = requiresAdmin || false

    this.supportsDM = supportsDM
  }

  userCanAccess (member, dm) {
    var isAdmin = member.client.config.admins.includes(member.id)
    if (this.requiresAdmin && !isAdmin) return false
    if (dm) return this.requiresAdmin ? isAdmin : true
    if (member) return (member.hasPermission(this.requiredPermissions) || member.guild.manager.properties.delegate == member.id) || isAdmin
    return false
  }
}

module.exports = Command
