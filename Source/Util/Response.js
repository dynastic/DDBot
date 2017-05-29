module.exports = class Response {
    constructor(message) {
        this.message = message;
        this.isDM = !message.guild;
        this.embedFactory = this.message.client.embedFactory;
    }

    send(content, embed, bypassRemoval) {
        var selfDestruct = (bypassRemoval || false) ? null : this.getMessageSelfDestructTime(true);
        var checkAutoRemove = (msg) => { if(selfDestruct != null) msg.delete(selfDestruct * 1000) };
        embed = this.modifyEmbedForSelfDestructTime(embed, selfDestruct);
        return embed ?
            this.message.channel.send(content, { embed }).then(msg => { checkAutoRemove(msg); return msg; }).catch(e => log(e, true)) :
            this.message.channel.send(content).then(msg => { checkAutoRemove(msg); return msg; }).catch(e => log(e, true));
    }

    edit(message, content, embed, bypassRemoval) {
        var selfDestruct = (bypassRemoval || false) ? null : this.getMessageSelfDestructTime(true);
        var checkAutoRemove = (msg) => { if(selfDestruct != null) msg.delete(selfDestruct * 1000) };
        embed = this.modifyEmbedForSelfDestructTime(embed, selfDestruct);
        return embed ?
            message.edit(content, { embed: embed }).then(msg => { checkAutoRemove(msg); return msg; }).catch(e => log(e, true)) :
            message.edit(content).then(msg => { checkAutoRemove(msg); return msg; }).catch(e => log(e, true));
    }

    reply(content, embed, bypassRemoval) {
        var contentSuffix = content && content != "" ? `: ${content}` : "";
        return this.send(`⦗${this.message.author}⦘${contentSuffix}`, embed, bypassRemoval);
    }

    dm(content, embed) {
        return embed ?
            this.message.author.send(content, { embed }) :
            this.message.author.send(content);
    }

    modifyEmbedForSelfDestructTime(embed, selfDestruct) {
        if(embed && selfDestruct != null) {
            if(!embed.footer) embed.footer = {text: ""};
            embed.footer.text = `This message will self-destruct in ${selfDestruct} second${selfDestruct == 1 ? "" : "s"}` + (embed.footer.text != "" ? " · " : "") + embed.footer.text;
        }
        return embed;
    }

    getMessageSelfDestructTime(isForBot) {
        if(this.isDM) return null;
        var guildConfig = this.message.guild.getConfig();
        var removeTime = isForBot ? guildConfig.autoRemoveBotMessages : guildConfig.autoRemoveUserCommands;
        if(removeTime != null && removeTime >= 0) return removeTime;
        return null;
    }

    log(message, error) {
        error ? console.error(message) : console.log(message);
    }

};
