const Discord = require("discord.js");
const fs = require("fs-extra-promise");
const path = require("path");
const mongoose = require('mongoose');
const autoIncrement = require("mongoose-auto-increment");

const MessagesManager = require("./Managers/Messages");
const DirectMessagesManager = require("./Managers/DirectMessages");
const CommandsManager = require("./Managers/Commands");
const InputUtilities = require("./Util/Input");

const Command = require("./Util/Command");

const client = new class extends Discord.Client {
    constructor() {
        super();

        this.fullPermissions = {
            CREATE_INSTANT_INVITE: "Create Instant Invite",
            KICK_MEMBERS: "Kick Members",
            BAN_MEMBERS: "Ban Members",
            ADMINISTRATOR: "Administrator",
            MANAGE_CHANNELS: "Manage Channels",
            MANAGE_GUILD: "Manage Server",
            ADD_REACTIONS: "Add Reactions",
            READ_MESSAGES: "Read Messages",
            SEND_MESSAGES: "Send Messages",
            SEND_TTS_MESSAGES: "Send TTS Messages",
            MANAGE_MESSAGES: "Manage Messages",
            EMBED_LINKS: "Embed Links",
            ATTACH_FILES: "Attach Files",
            READ_MESSAGE_HISTORY: "Read Message History",
            MENTION_EVERYONE: "Mention Everyone",
            EXTERNAL_EMOJIS: "Use External Emojis",
            CONNECT: "Connect (Voice)",
            SPEAK: "Speak (Voice)",
            MUTE_MEMBERS: "Mute Members (Voice)",
            DEAFEN_MEMBERS: "Deafen Members (Voice)",
            MOVE_MEMBERS: "Move Members (Voice)",
            USE_VAD: "Use Voice Activity", 
            CHANGE_NICKNAME: "Change Nickname",
            MANAGE_NICKNAMES: "Manage Nicknames",
            MANAGE_ROLES_OR_PERMISSIONS: "Manage Roles",
            MANAGE_WEBHOOKS: "Manage Webhooks",
            MANAGE_EMOJIS: "Manage Emojis"
        };

        this.messagesManager = new MessagesManager(this);
        this.directMessagesManager = new DirectMessagesManager(this);
        this.commandsManager = new CommandsManager(this);
        this.input = new InputUtilities(this);
        this.config = require("./config");

        mongoose.connect(this.config.database);
        autoIncrement.initialize(mongoose.connection);

        this.on("ready", () => {
            this.log(`Client ready to take commands`);
            this.user.setAvatar(__dirname + "/resources/icon.png");
            this.setStatusFromConfig();
        })
        .on("message", message => this.messagesManager.handle(message))
        .on("guildCreate", guild => this.saveConfig())
        .on("channelCreate", channel => {
            if(!channel.guild) return;
            let mutedRole = this.getMuteRoleForGuild(channel.guild);
            this.setMutedPermsOnChannel(channel, mutedRole);
        })
        .once("ready", () => {
            client.guilds.forEach(guild => {
                this.configureForGuild(guild);
            })
            this.saveConfig();
        });

        this.login(this.config.token);
    }

    configureForGuild(guild) {
        // Setup role guild roles
        return new Promise((resolve, reject) => {
            this.createMutedRole(guild);
            // Setup config space
            if(!this.config.guilds) this.config.guilds = {};
            if(!this.config.guilds[guild.id]) this.config.guilds[guild.id] = {};
            if(!this.config.guilds[guild.id].autoRemoveBotMessages) this.config.guilds[guild.id].autoRemoveBotMessages = 5;
            if(!this.config.guilds[guild.id].autoRemoveUserCommands) this.config.guilds[guild.id].autoRemoveUserCommands = 5;
            if(!this.config.guilds[guild.id].autoBanUserWarningPoints) this.config.guilds[guild.id].autoBanUserWarningPoints = 1000;
            if(!this.config.guilds[guild.id].autoKickUserWarningPoints) this.config.guilds[guild.id].autoKickUserWarningPoints = 300;
            this.config.guilds[guild.id].name = guild.name;
        });
    }

    createMutedRole(guild) {
        return new Promise((resolve, reject) => {
            let member = guild.members.get(this.user.id);
            if(member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && this.config.muteRole && this.config.muteRole != "") {
                let roleNames = guild.roles.array().map(role => role.name);
                if(roleNames.indexOf(this.config.muteRole) === -1) {
                    guild.createRole({
                        name: this.config.muteRole,
                        color: "#ff0000",
                        permissions: ["READ_MESSAGES", "CONNECT", "READ_MESSAGE_HISTORY"],
                        hoist: false,
                        mentionable: false
                    }).then(mutedRole => {
                        guild.channels.forEach(channel => {
                            this.setMutedPermsOnChannel(channel, mutedRole);
                        });
                        resolve(guild);
                    });
                } else {
                    let mutedRole = this.getMuteRoleForGuild(guild);
                    guild.channels.forEach(channel => {
                        this.setMutedPermsOnChannel(channel, mutedRole);
                    });
                    resolve(guild);
                }
            } else {
                resolve(guild);
            }
        });
    }

    getGuildConfig(guild) {
        return this.config.guilds[guild.id] || {};
    }

    setMutedPermsOnChannel(channel, mutedRole) {
        if(!mutedRole) return
        channel.overwritePermissions(mutedRole, {
            SEND_MESSAGES: false,
            SPEAK: false
        });
    }

    getMuteRoleForGuild(guild) {
        return guild.roles.find('name', this.config.muteRole);
    }

    setStatusFromConfig() {
        return this.user.setGame(this.config.status || "Set my status!");
    }

    saveConfig() {
        fs.writeFile(`${__dirname}/config.json`, JSON.stringify(this.config, null, 4));
    }

    log(content, error = false) {
        error ?
            console.error(content) :
            console.log(content);
    }
};

Discord.Guild.prototype.getConfig = function() {
    return this.client.getGuildConfig(this);
}

Discord.TextChannel.prototype.largeFetchMessages = function(limit) {
    var channel = this;
    return new Promise((resolve, reject) => {
        let retrievedMessages = [];
        function getMessages(beforeID) {
            let options = {limit: limit ? Math.min(100, Math.max(0, limit - retrievedMessages.length)) : 100};
            options.before = beforeID
            channel.fetchMessages(options).then((messages) => {
                retrievedMessages = retrievedMessages.concat(messages.array());;
                let last = messages.last();
                if(last && (retrievedMessages.length < limit || !limit)) return setTimeout(() => { getMessages(last.id) }, 250);
                 return resolve(retrievedMessages);
            }).catch((err) => {
                channel.client.log(err, true);
                resolve(retrievedMessages);
            });
        }
        getMessages(null);
    });
}