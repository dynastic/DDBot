const Command = require('../../Util/Command')

module.exports = new Command('stop', 'Stop the bot', null, ['die'],
    (client, message, response) => {
      response.reply('', response.embedFactory.createSuccessEmbed('Stopping', message.member).setDescription('The bot will now stop.')).then(msg => {
        client.destroy()
        process.exit()
      }).catch(e => client.log(e, true))
    }, [], true, true
)
