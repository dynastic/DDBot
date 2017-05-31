const Discord = require("discord.js")

module.exports = class EmbedFactory {
  constructor(client) {
      this.client = client;
  }

  createGeneralEmbed(title, color, authorizationMember) {
    var authorizedText = authorizationMember ? `This action was authorized by @${authorizationMember.user.username}#${authorizationMember.user.discriminator} · ` : ""
    var icon = authorizationMember ? authorizationMember.user.avatarURL : null;
    return new Discord.RichEmbed({ "title": title, "color": color, "footer": { "icon_url": icon, "text": `${authorizedText}${this.client.config.botName}` } });
  }

  createErrorEmbed(customTitle, authorizationMember) {
    return this.createGeneralEmbed(customTitle || "Error", 0xFF0000, authorizationMember);
  }

  createInformativeEmbed(customTitle, authorizationMember) {
    return this.createGeneralEmbed(customTitle || "Info", 0x7289DA, authorizationMember);
  }

  createSuccessEmbed(customTitle, authorizationMember) {
    return this.createGeneralEmbed(customTitle || "Success", 0x00FF00, authorizationMember);
  }

  createUnknownCommandEmbed() {
    return this.createErrorEmbed("Invalid Command").setDescription(`I didn't recognize that command. Try using \`${this.client.config.prefix}help\` to get a full list of commands.`);
  }

  createBadPermsEmbed() {
    return this.createErrorEmbed("Invalid Permissions").setDescription(`You do not have the required permissions to execute that command.`);
  }

  createBadArgsEmbed(command, message) {
    return this.createErrorEmbed("Bad Arguments").setDescription(`The arguments specified are invalid. ${message ? message : "Run \`" + this.client.config.prefix + "help" + command + "\` for more information."}`);
  }
};
