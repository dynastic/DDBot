const Command = require('../../../Util/Command')

module.exports = new Command('cointoss', 'Toss a coin!', null, ['toss', 'coin', 'flip', 'cointoss', 'tosscoin', 'coinflip', 'flipcoin'],
  (client, message, response) => {
    var tailsImage = 'http://i.imgur.com/E11z1g9.png'; var headsImage = 'http://i.imgur.com/dWv608X.png'
    var heads = Math.round(Math.random()) === 0
    response.reply('', response.embedFactory.createInformativeEmbed('Coin Toss').setDescription(`The coin landed on ${heads ? 'heads' : 'tails'}!`).setThumbnail(heads ? headsImage : tailsImage), true)
  }, [], false, true
)
