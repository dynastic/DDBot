const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Logger = require('../Util/Logger')

var UserInfoSchema = new Schema({
  userID: {
    type: String,
    required: true
  },
  guildID: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  }
})

UserInfoSchema.methods.toInfo = function () {
  return {
    points: this.points
  }
}

UserInfoSchema.statics.getDefaultInfo = function () {
  return {
    points: 0
  }
}

UserInfoSchema.statics.getUserInfo = function (user, guild, cb) {
  this.findOne({
    userID: user.id,
    guildID: guild.id
  }, (err, userInfo) => {
    if (err || !userInfo) return cb(this.getDefaultInfo())
    cb(userInfo.toInfo())
  })
}

UserInfoSchema.statics.getMemberInfo = function (member, cb) {
  return this.getUserInfo(member.user, member.guild, cb)
}

UserInfoSchema.statics.addWarningPoints = function (user, guild, points) {
  return new Promise((resolve, reject) => {
    this.findOneAndUpdate({
      userID: user.id,
      guildID: guild.id
    }, { $inc: { points } }, { upsert: true, new: true }, (err, userInfo) => {
      if (err) {
        Logger.error("Couldn't increment warning points: " + err)
        return reject(err)
      }
      if (userInfo.points < 0) {
        // Get back up to zero
        return this.addWarningPoints(user, guild, Math.abs(userInfo.points)).then(resolve).catch(reject)
      }
      resolve(userInfo)
    })
  })
}

module.exports = mongoose.model('UserInfo', UserInfoSchema)
