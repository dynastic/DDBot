const Command = require('../../../Util/Command')

module.exports = new Command('quote', "Quote a user's message!", '<message ID> [channel]', ['cite', 'echo', 'retell', 'repeat'],
  (client, message, response, args) => {
    if (!args[0] || args[1] !== message.mentions.channels.first()) return response.reply('', response.embedFactory.createErrorEmbed().setDescription("Please enter the ID of the message you want to quote. If you're specifying a channel, it must be the second argument."))
    var channel = message.mentions.channels.first() || message.channel
    channel.fetchMessage(args[0]).then(msg => {
      response.reply('', response.embedFactory.createInformativeEmbed(`Message in #${msg.channel.name}`)
        .setDescription(msg.content)
        .setAuthor(msg.member.displayName, msg.author.avatarURL)
        .setTimestamp(msg.createdAt), true)
    }).catch(err => {
      client.log(err, true)
      response.reply('', response.embedFactory.createErrorEmbed().setDescription(`There is no message with that ID in ${channel}.`))
    })
  }
)
