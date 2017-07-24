const JsDiff = require('diff')
const fs = require('fs-extra-promise')

class Steamboat {
  constructor (client) {
    this.client = client
    this.config = require('./config')
    this.meta = require('./module')
    this.load()
  }

  load () {
    if (!this.config.guilds) return this.client.log('Steamboat does not have any configured guilds. Please configure and re-start DDBot.', true)
    this.events = {
      channelCreate: (channel) => {
        if (channel.type !== 'text' && channel.type !== 'voice') return
        this.initialize(channel.guild).then(modLog => {
          modLog.send(`:baby: Channel created **#${channel.name}** \`(${channel.id})\``)
        }).catch(e => this.client.log(e, true))
      },
      channelDelete: (channel) => {
        if (channel.type !== 'text' && channel.type !== 'voice') return
        this.initialize(channel.guild).then(modLog => {
          modLog.send(`:skull: Channel deleted **#${channel.name}** \`(${channel.id})\``)
        }).catch(e => this.client.log(e, true))
      },
      guildBanAdd: (guild, user) => {
        this.initialize(guild).then(modLog => {
          modLog.send(`:rotating_light: \`${user.tag}\` (\`${user.id}\`) was banned`)
        }).catch(e => this.client.log(e, true))
      },
      guildBanRemove: (guild, user) => {
        this.initialize(guild).then(modLog => {
          modLog.send(`:white_check_mark: \`${user.tag}\` (\`${user.id}\`) was unbanned`)
        }).catch(e => this.client.log(e, true))
      },
      guildMemberAdd: (member) => {
        this.initialize(member.guild).then(modLog => {
          modLog.send(`:inbox_tray: ${member.user.tag} (\`${member.id}\`) joined the server (created ${member.user.createdAt.toLocaleString()})`)
        }).catch(e => this.client.log(e, true))
      },
      guildMemberRemove: (member) => {
        member.guild.fetchBans().then(bans => {
          if (bans.has(member.id)) return
          this.initialize(member.guild).then(modLog => {
            modLog.send(`:outbox_tray: ${member.user.tag} (\`${member.id}\`) left the server`)
          }).catch(e => this.client.log(e, true))
        })
      },
      messageDelete: (message) => {
        if (message.author.id === this.client.user.id || message.author.bot) return
        if (message.content !== this.client.config.prefix && message.content.startsWith(this.client.config.prefix) && !message.content.startsWith(this.client.config.prefix + this.client.config.prefix)) return
        this.initialize(message.guild).then(modLog => {
          modLog.send(`:wastebasket: ${message.author.tag} (\`${message.author.id}\`) message deleted in **#${message.channel.name}**:\n${message.cleanContent}`)
        }).catch(e => this.client.log(e, true))
      },
      messageDeleteBulk: (messages) => {
        messages.array().forEach(m => {
          if (m.author.id === this.client.user.id || m.author.bot) return
          if (m.content !== this.client.config.prefix && m.content.startsWith(this.client.config.prefix) && !m.content.startsWith(this.client.config.prefix + this.client.config.prefix)) return
          this.initialize(m.guild).then(modLog => {
            modLog.send(`:wastebasket: ${m.author.tag} (\`${m.author.id}\`) message deleted in **#${m.channel.name}**:\n${m.cleanContent}`)
          }).catch(e => this.client.log(e, true))
        })
      },
      messageUpdate: (oldM, newM) => {
        if (newM.author.id === this.client.user.id || newM.author.bot || oldM.content == newM.content) return;
        var oldContent = oldM.cleanContent.split("@").join("@​");
        var newContent = newM.cleanContent.split("@").join("@​");
        this.initialize(newM.guild).then(modLog => {
          var markdownDiff = ''
          JsDiff.diffChars(oldContent, newContent).forEach(diff => {
            if (diff.added) {
              markdownDiff += '**' + diff.value + '**'
            } else if (diff.removed) {
              markdownDiff += '~~' + diff.value + '~~'
            } else {
              markdownDiff += diff.value
            }
          })
          modLog.send(`:pencil: ${newM.author.tag} (\`${newM.author.id}\`) message edited in **#${newM.channel.name}**:\n${markdownDiff}`)
        }).catch(e => this.client.log(e, true))
      },
      roleCreate: (role) => {
        this.initialize(role.guild).then(modLog => {
          modLog.send(`:rotating_light: ***ROLE CREATED*** ${role.name} \`{permissions: ${role.permissions}}\``)
        }).catch(e => this.client.log(e, true))
      },
      roleDelete: (role) => {
        this.initialize(role.guild).then(modLog => {
          modLog.send(`:rotating_light: ***ROLE DELETED*** ${role.name}`)
        }).catch(e => this.client.log(e, true))
      },
      roleUpdate: (oldR, newR) => {
        this.initialize(newR.guild).then(modLog => {
          modLog.send(`:rotating_light: ***ROLE UPDATED*** ${newR.name} \`{oldPermissions: ${oldR.permissions}, newPermissions: ${newR.permissions}}\``)
        }).catch(e => this.client.log(e, true))
      }
    }
  }

  initialize (guild) {
    return new Promise((resolve, reject) => {
      if (!this.config.guilds[guild.id]) {
          this.config.guilds[guild.id] = {};
          this.saveConfig();
      }
      var channel = guild.channels.get(this.config.guilds[guild.id].channel)
      if (!channel) return reject(new Error(`No mod-log channel for guild ID ${guild.id} (steamboat will be disabled for this server, run the modlog command on that guild to fix it).`))
      resolve(channel)
    })
  }

  saveConfig () {
    fs.writeFile(`${__dirname}/config.json`, JSON.stringify(this.config, null, 4))
  }
}

module.exports = Steamboat
