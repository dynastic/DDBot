const Discord = require("discord.js")
require('string.prototype.at');

module.exports = class Input {
  constructor(client) {
      this.client = client;
      this.trueBoolResponses = ["y", "yes", "ya", "yeah", "yas", "yea", "yah", "true", "t", "treu", "1", "oui", "si"];
      this.falseBoolResponses = ["n", "no", "na", "nah", "naw", "nou", "false", "f", "fals", "0", "non"];
  }

  parseBooleanResponse(response) {
    if(this.trueBoolResponses.includes(response.toLowerCase())) return true;
    if(this.falseBoolResponses.includes(response.toLowerCase())) return false;
    return null;
  }

  emojify(text) {
      var newText = "";
      for (var i = 0; i<text.length; i++){
        var strChar = text.at(i).toLowerCase();
        if(strChar.match(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g)) newText += strChar;
        let char = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        if(char.includes(strChar)) newText += `:regional_indicator_${strChar}:`;
        if(strChar == "1") newText += ":one:";
        if(strChar == "2") newText += ":two:";
        if(strChar == "3") newText += ":three:";
        if(strChar == "4") newText += ":four:";
        if(strChar == "5") newText += ":five:";
        if(strChar == "6") newText += ":six:";
        if(strChar == "7") newText += ":seven:";
        if(strChar == "8") newText += ":eight:";
        if(strChar == "9") newText += ":nine:";
        if(strChar == "0") newText += ":zero:";
        if(strChar == " ") newText += "    ";
        if(strChar == "!") newText += ":exclamation:";
        if(strChar == "?") newText += ":question:";
        if(strChar == "+") newText += ":heavy_plus_sign:";
        if(strChar == "-") newText += ":heavy_minus_sign:";
        if(strChar == "?") newText += ":question:";
      }
      return newText;
  }
};
