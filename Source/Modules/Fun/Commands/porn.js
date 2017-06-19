const Command = require('../../../Util/Command')

module.exports = new Command('porn', "You'll see", null, ['pr0n', 'sex', 'ass', 'dick', 'penis', 'vag', 'pussy', 'vagina', 'cum', 'pornhub', 'thehub'],
  (client, message, response) => {
    response.reply('Fuck off, you fucking perv.')
  }, [], false, true
)
