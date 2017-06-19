const Discord = require('discord.js')
const Command = require('../../../Util/Command')
const Moderation = require('../../../Util/Moderation')
const moment = require('moment')
var rp = require('request-promise')

module.exports = new Command('archive', 'Uploads messages to ghostbin', '[count:10]', [],
    (client, message, response, args) => {
      var count = args[0]
      if (count && isNaN(count)) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('Please enter a numeric amount.'))
      if (count) count = parseInt(count)
      if (count && (count < 1)) return response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('The amount of messages to archive must be at least 1.'))
      response.reply('', response.embedFactory.createInformativeEmbed('Retrieving messages...', message.member).setDescription("An archive of this channel's messages is being created..."), true).then(postedMessage => {
        var msg2 = postedMessage
        message.channel.largeFetchMessages(count + 2).then(messages => {
          var archivedLines = [`=== [ MESSAGES ARCHIVED FROM #${message.channel.name.toUpperCase()} (${message.guild.name.toUpperCase()}) ] ===\n`]
          var recordedMessages = 0
          messages.forEach((msg, index, arr) => {
            if (msg.cleanContent == '') return
            if (msg.id == msg2.id || msg.id == message.id) return // return if message is bot's message or command message
            var ts = msg.createdAt
            var name = getFormattedDisplayName(msg.author, message.msg)
                    // Datestamp
            var shouldShowDatestamp = true
            if (arr[index - 1]) shouldShowDatestamp = !moment(ts).isSame(arr[index - 1].createdAt, 'day')
            var formattedTime = moment.utc(ts).format('HH:mm:ss')
            if (shouldShowDatestamp) archivedLines.push(` ---( ${moment.utc(ts).format('MMMM Do, YYYY')} )--- `)
                    // Push our message line
            recordedMessages += 1
            archivedLines.push(`[${formattedTime}] ${name}: ${getFormattedContent(msg)}`)
          })
          archivedLines.push('\n=== [ MESSAGE ARCHIVE END ] ===')
          archivedLines.push('(Created with DDBot. All dates are UTC.)')
          var archiveText = archivedLines.join('\n')
          response.edit(postedMessage, postedMessage.content, response.embedFactory.createInformativeEmbed('Uploading...', message.member).setDescription("An archive of this channel's messages is being uploaded to Ghostbin..."), true).then(postedMessage => {
            rp({url: 'https://www.ghostbin.com/paste/new', method: 'POST', form: {'text': archiveText, 'lang': 'text'}, headers: {'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'DDBot/1.0'}}).catch(function (err) {
              var redirectURL = err.response.headers.location
              if (err.name == 'StatusCodeError' && err.statusCode == 303 && redirectURL) {
                var url = 'https://www.ghostbin.com' + redirectURL
                response.edit(msg2, msg2.content, response.embedFactory.createSuccessEmbed('Upload Complete', message.member).setDescription("An archive of this channel's message has been uploaded to Ghostbin.").addField('URL', url, true).addField('Messages', recordedMessages, true).setURL(url), true)
              } else {
                client.log(err, true)
                response.edit(msg2, msg2.content, response.embedFactory.createErrorEmbed(null, message.member).setDescription('An error occurred while trying to upload the archive to Ghostbin.'))
              }
            })
          }).catch(e => client.log(e, true))
        }).catch(err => {
          client.log(err, true)
          response.reply('', response.embedFactory.createErrorEmbed(null, message.member).setDescription('An unknown error occurred while trying to archive messages.'))
        })
      }).catch(e => client.log(e, true))
    }, ['MANAGE_MESSAGES']
)

var getFormattedDisplayName = (user, member) => {
  return `${user.username}#${user.discriminator}` + (member && member.nickname ? ` (${member.nickname})` : '') + (user.bot ? ' [BOT]' : '')
}

var getFormattedContent = (msg) => {
  var contents = [msg.cleanContent]
  if (msg.embeds && msg.embeds.length > 0) {
    contents.push(`<message has ${msg.embeds.length} embed${msg.embeds.length == 1 ? '' : 's'}>: [`)
    for (i = 0; i < msg.embeds.length; i++) {
      var embed = msg.embeds[i]
      if (embed.title == 'Available Commands') { contents.push(`{title: "Help Command", description: "Description withheld to prevent archive spam"}`); continue }
      var fields = []
      if (embed.fields) embed.fields.forEach(field => fields.push(`{name: "${field.name}", value: "${field.value}"}`))
      contents.push(`{title: "${embed.title}", description: "${embed.description ? embed.description : 'none'}", fields: [${fields}]}${i != msg.embeds.length - 1 ? ',' : ''}`)
    }
    contents.push(`]`)
  };
  if (msg.pinned) contents.push(`<message is pinned>`)
  return contents.join(' ')
}
