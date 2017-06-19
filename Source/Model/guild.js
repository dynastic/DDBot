const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Logger = require('../Util/Logger')

var GuildSchema = new Schema({
  snowflake: {
    type: String,
    required: true
  },
  autoRemoveBotMessages: {
    type: Number,
    default: 5,
    required: true
  },
  autoRemoveUserCommands: {
    type: Number,
    default: 5,
    required: true
  },
  autoBanUserWarningPoints: {
    type: Number,
    default: 1000,
    required: true
  },
  autoKickUserWarningPoints: {
    type: Number,
    default: 300,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  delegate: {
    type: String,
    required: false
  },
  disabledCommands: [{
    type: String,
    required: true
  }],
  disabledModules: [{
    type: String,
    required: true
  }]
})

GuildSchema.statics.createConfig = function (snowflake, name) {
  return new Promise((resolve, reject) => {
    var newConfig = this({
      snowflake,
      name
    })

    newConfig.save(function (err) {
      if (err) {
        Logger.error('Error trying to save guild configuration: ' + err)
        return reject(err)
      }
      resolve(newConfig)
    })
  })
}

module.exports = mongoose.model('GuildConfig', GuildSchema)
