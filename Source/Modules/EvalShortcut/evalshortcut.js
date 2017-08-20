class EvalShortcut {
  constructor (client) {
    this.client = client;
    this.response = this.client.resolve('response');
    if (!this.response) return this.client.log('[EvalShortcut] Disabling because response class could not be found', true);
    this.response = require(this.response);
    this.meta = require('./module');
    this.config = require('./config');
    this.events = {
      message: (message) => {
        if (message.content === this.config.prefix || !message.content.startsWith(this.config.prefix) || message.content.startsWith(this.config.prefix + this.config.prefix) || !this.client.config.admins.includes(message.member.id)) return;
        this.client.commandsManager.get('eval').then(c => {
          if (!c) return;
          var args = message.content.split(' ');
          args[0] = args[0].slice(this.config.prefix.length);
          args.unshift(`${client.config.prefix}eval`);
          message.content = args.join(' ');
          message.channel.type === 'dm' ? client.directMessagesManager.handle(message) : message.guild.manager.messagesManager.handle(message);
        })
      }
    }
  }
}

module.exports = EvalShortcut
