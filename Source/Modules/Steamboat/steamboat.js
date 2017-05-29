const JsDiff = require("diff");
const fs = require("fs-extra-promise");
const path = require("path");

class Steamboat {
    static get IDENTIFIER() {
        return "dynastic.steamboat";
    }

    constructor(client) {
        this.client = client;
        this.config = require('./config');
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
            if(message.author.id == this.client.user.id) return;
            if(message.content !== this.client.config.prefix && message.content.startsWith(this.client.config.prefix) && !message.content.startsWith(this.client.config.prefix + this.client.config.prefix)) return;
            this.initialize(message.guild).then(modLog => {
                modLog.send(`:wastebasket: ${message.author.tag} (\`${message.author.id}\`) message deleted in **#${message.channel.name}**:\n${message.cleanContent}`);
            }).catch(e => this.client.log(e, true));
        }).on('messageDeleteBulk', messages => {
            messages.array().forEach(m => {
                if(m.author.id == this.client.user.id) return;
                if(m.content !== this.client.config.prefix && m.content.startsWith(this.client.config.prefix) && !m.content.startsWith(this.client.config.prefix + this.client.config.prefix)) return;
                this.initialize(m.guild).then(modLog => {
                    modLog.send(`:wastebasket: ${m.author.tag} (\`${m.author.id}\`) message deleted in **#${m.channel.name}**:\n${m.cleanContent}`)
                }).catch(e => this.client.log(e, true))
            })
        }).on('messageUpdate', (oldM, newM) => {
            if(newM.author.id == this.client.user.id) return;
            this.initialize(newM.guild).then(modLog => {
                var markdownDiff = "";
                JsDiff.diffChars(oldM.content, newM.content).forEach(diff => {
                    if(diff.added) {
                        markdownDiff += "**" + diff.value + "**";
                    } else if(diff.removed) {
                        markdownDiff += "~~" + diff.value + "~~";
                    } else {
                        markdownDiff += diff.value;
                    }
                });
                modLog.send(`:pencil: ${newM.author.tag} (\`${newM.author.id}\`) message edited in #${newM.channel.name}:\n${markdownDiff}`)
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