const Command = require('../../../Util/Command')
var rp = require('request-promise')

module.exports = new Command('urbandictionary', 'Look up a term using Urban Dictionary', '<query>', ['urban', 'ud', 'urband', 'defineurban', 'urbandefinition', 'udictionary', 'udict', 'urbandict'],
  (client, message, response, args) => {
    if (!args[0]) return response.reply('', response.embedFactory.createErrorEmbed().setDescription('Please enter a term to look up using Urban Dictionary.'))
    var query = args.join(' ')
    response.reply('', response.embedFactory.createInformativeEmbed('Retrieving result...').setDescription('Contacting Urban Dictionary...'), true).then(postedMessage => {
      rp({url: 'http://api.urbandictionary.com/v0/define?term=' + encodeURIComponent(query)}).then(body => {
        var url = `http://www.urbandictionary.com/define.php?term=${encodeURIComponent(query)}`
        var result = JSON.parse(body)
        if (result.result_type !== 'exact') return response.edit(postedMessage, postedMessage.content, response.embedFactory.createErrorEmbed('No results').setDescription(`Urban Dictionary returned no results for the term *${query}*.`).setURL(url))
        var embed = response.embedFactory.createSuccessEmbed('Results').setDescription(`The first few Urban Dictionary results for *${query}*:`).setURL(url)
        if (result.list) {
          result.list.slice(0, 3).forEach(result => {
            var text = result.definition + (result.example && result.example !== '' ? `\n*${result.example}*` : '')
            if (text !== '') embed.addField(result.word, truncateNicely(text, 300, `… [Read more](${result.permalink})`), true)
          })
        }
        response.edit(postedMessage, postedMessage.content, embed, true)
      }).catch(err => {
        client.log(err, true)
        response.edit(postedMessage, postedMessage.content, response.embedFactory.createErrorEmbed().setDescription('An error occurred while trying to the provided term with Urban Dictionary.'))
      })
    }).catch(e => client.log(e, true))
  }, [], false, true
)

var truncateNicely = (str, limit, suffix) => {
  var s = suffix || '…'
  if (str.length > limit && limit > s.length) return str.substring(0, limit - s.length) + s
  return str
}
