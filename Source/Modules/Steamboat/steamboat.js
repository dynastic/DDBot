const config = require('./config');

class Steamboat {
    static get IDENTIFIER() {
        return "dynastic.steamboat";
    }

    constructor(client) {
        this.client = client;
        this.config = config;
        this.load();
    }

    load() {
        if (!this.config.guilds) return this.client.log("Steamboat does not have any configured guilds. Please configure and re-start DDBot.", true);
        this.client.on('channelCreate', channel => {
            if (channel.type !== "text" && channel.type !== "voice") return;
            this.initialize(channel.guild).then(modLog => {
                modLog.send(`:baby: Channel created **#${channel.name}** \`(${channel.id})\``);
            }).catch(e => this.client.log(e, true));
        }).on('channelDelete', channel => {
            if (channel.type !== "text" && channel.type !== "voice") return;
            this.initialize(channel.guild).then(modLog => {
                modLog.send(`:skull: Channel deleted **#${channel.name}** \`(${channel.id})\``);
            }).catch(e => this.client.log(e, true));
        }).on('guildBanAdd', (guild, user) => {
            this.initialize(guild).then(modLog => {
                modLog.send(`:rotating_light: \`${user.tag}\` (\`${user.id}\`) was banned`);
            }).catch(e => this.client.log(e, true));
        }).on('guildBanRemove', (guild, user) => {
            this.initialize(guild).then(modLog => {
                modLog.send(`:white_check_mark: \`${user.tag}\` (\`${user.id}\`) was unbanned`);
            }).catch(e => this.client.log(e, true));
        }).on('guildMemberAdd', member => {
            this.initialize(member.guild).then(modLog => {
                modLog.send(`:inbox_tray: ${member.user.tag} (\`${member.id}\`) joined the server (created ${member.user.createdAt.toLocaleString()})`);
            }).catch(e => this.client.log(e, true));
        }).on('guildMemberRemove', member => {
            member.guild.fetchBans().then(bans => {
                if (bans.has(member.id)) return;
                this.initialize(member.guild).then(modLog => {
                    modLog.send(`:outbox_tray: ${member.user.tag} (\`${member.id}\`) left the server`);
                }).catch(e => this.client.log(e, true));
            });
        }).on('messageDelete', message => {
            if(message.author.bot) return;
            this.initialize(message.guild).then(modLog => {
                modLog.send(`:wastebasket: ${message.author.tag} (\`${message.author.id}\`) message deleted in **#${message.channel.name}**:\n${message.cleanContent}`);
            }).catch(e => this.client.log(e, true));
        }).on('messageDeleteBulk', messages => {
            messages.array().forEach(m => {
                this.initialize(m.guild).then(modLog => {
                    modLog.send(`:wastebasket: ${m.author.tag} (\`${m.author.id}\`) message deleted in **#${m.channel.name}**:\n${m.cleanContent}`)
                }).catch(e => this.client.log(e, true))
            })
        }).on('messageUpdate', (oldM, newM) => {
            this.initialize(newM.guild).then(modLog => {
                modLog.send(`:pencil: ${message.author.tag} (\`${message.author.id}\`) message edited in #report-abuse:\nB: ${oldM.text}\nA: ${newM.text}`)
            }).catch(e => this.client.log(e, true));
        }).on('roleCreate', role => {
            this.initialize(role.guild).then(modLog => {
                modLog.send(`:rotating_light: ***ROLE CREATED*** ${role.name} \`{permissions: ${role.permissions}}\``)
            }).catch(e => this.client.log(e, true));
        }).on('roleDelete', role => {
            this.initialize(role.guild).then(modLog => {
                modLog.send(`:rotating_light: ***ROLE DELETED*** ${role.name}`)
            }).catch(e => this.client.log(e, true))
        }).on('roleUpdate', (oldR, newR) => {
            this.initialize(role.guild).then(modLog => {
                modLog.send(`:rotating_light: ***ROLE UPDATED*** ${newR.name} \`{oldPermissions: ${oldR.permissions}, newPermissions: ${newR.permissions}}\``);
            }).catch(e => this.client.log(e, true));
        })
    }

    initialize(guild) {
        return new Promise((resolve, reject) => {
            if (!this.config.guilds[guild.id]) return reject("No guild in config for ID " + guild.id);
            var channel = guild.channels.get(this.config.guilds[guild.id].channel);
            if (!channel) return reject("No mod-log channel for guild ID " + guild.id);
            resolve(channel);
        });
    }

    saveConfig() {
        fs.writeFile(`${__dirname}/config.json`, JSON.stringify(this.config, null, 4));
    }
}

module.exports = Steamboat;