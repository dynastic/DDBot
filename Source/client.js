const Discord = require("discord.js");
const fs = require("fs-extra-promise");
const path = require("path");
const mongoose = require('mongoose');
const autoIncrement = require("mongoose-auto-increment");

const ModuleManager = require("./Managers/Modules");
const CommandsManager = require("./Managers/Commands");
const InputUtilities = require("./Util/Input");

const DirectMessagesManager = require("./Managers/DirectMessages");

const Command = require("./Util/Command");

const EmbedFactory = require("./Util/EmbedFactory");

const client = new class extends Discord.Client {
    constructor() {
        super();
        process.on('unhandledRejection', rejection => {
            console.log(rejection);
        })
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
        
        this.cwd = __dirname;
        this.embedFactory = new EmbedFactory(this);
        this.commandsManager = new CommandsManager(this);
        this.directMessagesManager = new DirectMessagesManager(this);
        this.modulesManager = new ModuleManager(this, this.commandsManager);
        this.input = new InputUtilities(this);
        this.config = require("./config");
        this.meta = require("../package");

        mongoose.connect(this.config.database);
        autoIncrement.initialize(mongoose.connection);

        this.on("ready", () => {
            this.log(`Client ready to take commands`);
            this.user.setAvatar(__dirname + "/resources/icon.png").catch(e => e.code !== undefined ? this.log(e, true) : null);
            this.setStatusFromConfig();
        })
            .on("message", message => message.guild ? message.guild.manager.messagesManager.handle(message) : this.directMessagesManager.handle(message))
            .on("guildCreate", guild => this.saveConfig())
            .on("channelCreate", channel => {
                if (!channel.guild) return;
                var mutedRole = this.getMuteRoleForGuild(channel.guild);
                this.setMutedPermsOnChannel(channel, mutedRole);
            })
            .once("ready", () => {
                client.guilds.forEach(guild => {
                    this.configureForGuild(guild);
                })
                this.saveConfig();
            });
        this.on("channelCreate", channel => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (channel.guild.getConfig().disabledModules && channel.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.channelCreate) moduleEvent.events.channelCreate(channel);
            })
        }).on("channelDelete", channel => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (channel.guild.getConfig().disabledModules && channel.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.channelDelete) moduleEvent.events.channelDelete(channel);
            })
        }).on("channelPinsUpdate", (channel, time) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (channel.guild.getConfig().disabledModules && channel.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.channelPinsUpdate) moduleEvent.events.channelPinsUpdate(channel);
            })
        }).on("channelUpdate", (oldChannel, newChannel) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newChannel.guild.getConfig().disabledModules && newChannel.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.channelUpdate) moduleEvent.events.channelUpdate(oldChannel, newChannel);
            })
        }).on("clientUserSettingsUpdate", (clientUserSettings) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.clientUserSettingsUpdate) moduleEvent.events.clientUserSettingsUpdate(clientUserSettings);
            })
        }).on("debug", (info) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.debug) moduleEvent.events.debug(info);
            })
        }).on("disconnect", (event) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.disconnect) moduleEvent.events.disconnect(event);
            })
        }).on("emojiCreate", (emoji) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (emoji.guild.getConfig().disabledModules && emoji.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.emojiCreate) moduleEvent.events.emojiCreate(emoji);
            })
        }).on("emojiDelete", (emoji) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (emoji.guild.getConfig().disabledModules && emoji.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.emoji) moduleEvent.events.emoji(emoji);
            })
        }).on("emojiUpdate", (oldEmoji, newEmoji) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newEmoji.guild.getConfig().disabledModules && newEmoji.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.emojiUpdate) moduleEvent.events.emojiUpdate(oldEmoji, newEmoji);
            })
        }).on("guildBanAdd", (guild, user) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (guild.getConfig().disabledModules && guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildBanAdd) moduleEvent.events.guildBanAdd(guild, user);
            })
        }).on("guildBanRemove", (guild, user) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (guild.getConfig().disabledModules && guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildBanRemove) moduleEvent.events.guildBanRemove(guild, user);
            })
        }).on("guildCreate", (guild) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (guild.getConfig().disabledModules && guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildCreate) moduleEvent.events.guildCreate(guild);
            })
        }).on("guildDelete", (guild) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (guild.getConfig().disabledModules && guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildDelete) moduleEvent.events.guildDelete(guild);
            })
        }).on("guildMemberAdd", (member) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (member.guild.getConfig().disabledModules && member.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildMemberAdd) moduleEvent.events.guildMemberAdd(member);
            })
        }).on("guildMemberAvailable", (member) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (member.guild.getConfig().disabledModules && member.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildMemberAvailable) moduleEvent.events.guildMemberAvailable(member);
            })
        }).on("guildMemberRemove", (member) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (member.guild.getConfig().disabledModules && member.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildMemberRemove) moduleEvent.events.guildMemberRemove(member);
            })
        }).on("guildMembersChunk", (collection, guild) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (guild.getConfig().disabledModules && guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildMembersChunk) moduleEvent.events.guildMembersChunk(collection, guild);
            })
        }).on("guildMemberSpeaking", (member, speaking) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (member.guild.getConfig().disabledModules && member.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildMemberSpeaking) moduleEvent.events.guildMemberSpeaking(member, speaking);
            })
        }).on("guildMemberUpdate", (oldMember, newMember) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newMember.guild.getConfig().disabledModules && newMember.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildMemberUpdate) moduleEvent.events.guildMemberUpdate(oldMember, newMember);
            })
        }).on("guildUnavailable", (guild) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (guild.getConfig().disabledModules && guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildUnavailable) moduleEvent.events.guildUnavailable(guild);
            })
        }).on("guildUpdate", (oldGuild, newGuild) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newGuild.getConfig().disabledModules && newGuild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.guildUpdate) moduleEvent.events.guildUpdate(oldGuild, newGuild);
            })
        }).on("message", (message) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (message.type == "text") {
                    if (message.guild.getConfig().disabledModules && message.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                }
                if (moduleEvent.events && moduleEvent.events.message) moduleEvent.events.message(message);
            })
        }).on("messageDelete", (message) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (message.type == "text") {
                    if (message.guild.getConfig().disabledModules && message.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                }
                if (moduleEvent.events && moduleEvent.events.messageDelete) moduleEvent.events.messageDelete(message);
            })
        }).on("messageDeleteBulk", (collection) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (collection.first().type == "text") {
                    if (collection.first().guild.getConfig().disabledModules && collection.first().guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                }
                if (moduleEvent.events && moduleEvent.events.messageDeleteBulk) moduleEvent.events.messageDeleteBulk(collection);
            })
        }).on("messageReactionAdd", (messageReaction, user) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (messageReaction.message.type == "text") {
                    if (messageReaction.message.guild.getConfig().disabledModules && messageReaction.message.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                }
                if (moduleEvent.events && moduleEvent.events.messageReactionAdd) moduleEvent.events.messageReactionAdd(messageReaction, user);
            })
        }).on("messageReactionRemove", (messageReaction, user) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (messageReaction.message.type == "text") {
                    if (messageReaction.message.guild.getConfig().disabledModules && messageReaction.message.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                }
                if (moduleEvent.events && moduleEvent.events.messageReactionRemove) moduleEvent.events.messageReactionRemove(messageReaction, user);
            })
        }).on("messageReactionRemoveAll", (message) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if(message.type == "text") {
                    if (message.guild.getConfig().disabledModules && message.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                }
                if (moduleEvent.events && moduleEvent.events.messageReactionRemoveAll) moduleEvent.events.messageReactionRemoveAll(message);
            })
        }).on("messageUpdate", (oldMessage, newMessage) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newMessage.type == "text") {
                    if (newMessage.guild.getConfig().disabledModules && newMessage.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                }
                if (moduleEvent.events && moduleEvent.events.messageUpdate) moduleEvent.events.messageUpdate(oldMessage, newMessage);
            })
        }).on("presenceUpdate", (oldMember, newMember) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newMember.guild.getConfig().disabledModules && newMember.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.presenceUpdate) moduleEvent.events.presenceUpdate(oldMember, newMember);
            })
        }).on("reconnecting", () => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.reconnecting) moduleEvent.events.reconnecting();
            })
        }).on("resume", (replayed) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.resume) moduleEvent.events.resume(replayed);
            })
        }).on("roleCreate", (role) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (role.guild.getConfig().disabledModules && role.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.roleCreate) moduleEvent.events.roleCreate(role);
            })
        }).on("roleDelete", (role) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (role.guild.getConfig().disabledModules && role.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.roleDelete) moduleEvent.events.roleDelete(role);
            })
        }).on("roleUpdate", (oldRole, newRole) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newRole.guild.getConfig().disabledModules && newRole.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.roleUpdate) moduleEvent.events.roleUpdate(oldRole, newRole);
            })
        }).on("typingStart", (channel, user) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (channel.guild.getConfig().disabledModules && channel.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.typingStart) moduleEvent.events.typingStart(channel, user);
            })
        }).on("typingStop", (channel, user) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (channel.guild.getConfig().disabledModules && channel.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.typingStop) moduleEvent.events.typingStop(channel, user);
            })
        }).on("userNoteUpdate", (user, oldNote, newNote) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.userNoteUpdate) moduleEvent.events.userNoteUpdate(user, oldNote, newNote);
            })
        }).on("userUpdate", (oldUser, newUser) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.userUpdate) moduleEvent.events.userUpdate(oldUser, newUser);
            })
        }).on("voiceStateUpdate", (oldMember, newMember) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (!moduleEvent.meta || !moduleEvent.meta.identifier) return;
                if (newMember.guild.getConfig().disabledModules && newMember.guild.getConfig().disabledModules.includes(moduleEvent.meta.identifier)) return;
                if (moduleEvent.events && moduleEvent.events.voiceStateUpdate) moduleEvent.events.voiceStateUpdate(oldMember, newMember);
            })
        }).on("warn", (info) => {
            this.modulesManager.modules.forEach(moduleEvent => {
                if (moduleEvent.events && moduleEvent.events.warn) moduleEvent.events.warn(info);
            })
        })
        this.login(this.config.token);
    }

    configureForGuild(guild) {
        // Setup role guild roles
        return new Promise((resolve, reject) => {
            this.createMutedRole(guild);
            // Setup config space
            if (!this.config.guilds) this.config.guilds = {};
            if (!this.config.guilds[guild.id]) this.config.guilds[guild.id] = {};
            if (!this.config.guilds[guild.id].autoRemoveBotMessages) this.config.guilds[guild.id].autoRemoveBotMessages = 5;
            if (!this.config.guilds[guild.id].autoRemoveUserCommands) this.config.guilds[guild.id].autoRemoveUserCommands = 5;
            if (!this.config.guilds[guild.id].autoBanUserWarningPoints) this.config.guilds[guild.id].autoBanUserWarningPoints = 1000;
            if (!this.config.guilds[guild.id].autoKickUserWarningPoints) this.config.guilds[guild.id].autoKickUserWarningPoints = 300;
            if (!this.config.guilds[guild.id].disabledCommands) this.config.guilds[guild.id].disabledCommands = [];
            if (!this.config.guilds[guild.id].disabledModules) this.config.guilds[guild.id].disabledModules = [];
            this.config.guilds[guild.id].name = guild.name;
            guild.getManager();
        });
    }

    createMutedRole(guild) {
        return new Promise((resolve, reject) => {
            var member = guild.members.get(this.user.id);
            if (member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && this.config.muteRole && this.config.muteRole != "") {
                var roleNames = guild.roles.array().map(role => role.name);
                if (roleNames.indexOf(this.config.muteRole) === -1) {
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
                    }).catch(e => this.log(e, true));
                } else {
                    var mutedRole = this.getMuteRoleForGuild(guild);
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
        if (!mutedRole) return
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

Discord.Guild.prototype.getConfig = function () {
    return this.client.getGuildConfig(this);
}

Discord.Guild.prototype.getManager = function () {
    const GuildInstance = require(this.client.cwd + path.sep + "Managers" + path.sep + "GuildInstance");
    if (!this.manager) this.manager = new GuildInstance(this);
    return this.manager;
}

Discord.TextChannel.prototype.largeFetchMessages = function (limit) {
    var channel = this;
    return new Promise((resolve, reject) => {
        var retrievedMessages = [];
        function getMessages(beforeID) {
            var options = { limit: limit ? Math.min(100, Math.max(0, limit - retrievedMessages.length)) : 100 };
            options.before = beforeID
            channel.fetchMessages(options).then((messages) => {
                retrievedMessages = retrievedMessages.concat(messages.array());;
                var last = messages.last();
                if (last && (retrievedMessages.length < limit || !limit)) return setTimeout(() => { getMessages(last.id) }, 250);
                return resolve(retrievedMessages);
            }).catch((err) => {
                channel.client.log(err, true);
                resolve(retrievedMessages);
            });
        }
        getMessages(null);
    });
}