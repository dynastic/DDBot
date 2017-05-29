const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require("mongoose-auto-increment");

var CaseSchema = new Schema({
    modID: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    reason: {
        type: String
    },
    points: {
        type: Number
    },
    number: {
        type: Number,
        required: true
    },
    guildID: {
        type: String,
        required: true
    }
});

CaseSchema.statics.createCase = function(modUser, type, user, guild, reason = null, points = null) {
    return new Promise((resolve, reject) => {
        var newCase = this({
            modID: modUser.id,
            type: type,
            userID: user.id,
            guildID: guild.id,
            reason: reason,
            points: points,
            date: Date()
        });
        newCase.save(function(err) {
            if (err) {
                console.error("Error trying to save case: " + err);
                return reject(err);
            }
            resolve(newCase);
        });
    })
}
CaseSchema.plugin(autoIncrement.plugin, { model: 'Case', field: 'number' });

module.exports = mongoose.model('Case', CaseSchema);