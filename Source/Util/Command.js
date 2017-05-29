class Command {
    constructor(command, description, argumentHints, aliases, execute, requiredPermissions, requiresAdmin) {
        this.command = command;

        this.description = description;

        this.argumentHints = argumentHints ? " " + argumentHints : "";

        this.aliases = aliases;

        this.execute = execute;

        this.requiredPermissions = requiredPermissions || [];

        this.requiresAdmin = requiresAdmin || false;
    }

    userCanAccess(member) {
        var isAdmin = member.client.config.admins.includes(member.id);
        if(this.requiresAdmin && !isAdmin) return false;
        if(member) return (member.hasPermission(this.requiredPermissions)) || isAdmin;
        return false;
    }

}

module.exports = Command;
