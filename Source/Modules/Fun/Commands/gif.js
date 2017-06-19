const Command = require('../../../Util/Command')
const request = require('request')
const qs = require('querystring')

module.exports = new Command('gif', 'Get a sexy gif', null, ['giphy', 'giph', 'imgur', 'gify'],
  (client, message, response, args) => {
    new Promise((resolve, reject) => {
      var params = {
        'api_key': 'dc6zaTOxFJmzC',
        'rating': 'r',
        'format': 'json',
        'limit': 1
      }
      var query = qs.stringify(params)
      if (args) query += `&tag=${args.join('+')}`
      request(`http://api.giphy.com/v1/gifs/random${query ? '?' + query : ''}`, (error, response, body) => {
        if (error || response.statusCode !== 200) client.log(`Giphy Error: ${error}`, true)
        else {
          try {
            var responseObj = JSON.parse(body)
            return resolve(responseObj.data.id)
          } catch (err) {
            return resolve()
          }
        }
      })
    }).then(id => {
      id
        ? message.channel.send('', {embed: response.embedFactory.createInformativeEmbed().setImage(`http://media.giphy.com/media/${id}/giphy.gif`).setFooter(`[Tags: ${args.length > 0 ? args : 'Random GIF'}]`).setTitle('GIPHY')})
        : response.send('', response.embedFactory.createErrorEmbed().setDescription(`Invalid tags, try something different.`).setFooter(`[Tags: ${args.length > 0 ? args : 'Random GIF'}]`).setTitle('GIPHY'))
    }).catch(err => {
      client.log(err, true)
    })
  }, [], false, true
)
