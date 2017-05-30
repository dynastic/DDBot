const Command = require("../../Util/Command");
const Moderation = require("../../Util/Moderation");
var rp = require('request-promise');

module.exports = new Command("wolframalpha", "Submit your query to Wolfram Alpha", "<query>", ["alpha", "wolfram", "query", "wa"],
    (client, message, response, args) => {
        if(!args[0]) return response.reply("", response.embedFactory.createErrorEmbed().setDescription("Please enter a query to submit to Wolfram Alpha."));
        var query = args.join(" ");
        var headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30", "Origin": "https://products.wolframalpha.com", "Referer": "https://products.wolframalpha.com/api/explorer/", "Accept": "*/*"};
        response.reply("", response.embedFactory.createInformativeEmbed("Retrieving result...").setDescription("Contacting Wolfram Alpha..."), true).then(postedMessage => {
            rp({url: 'https://www.wolframalpha.com/input/apiExplorer.jsp?input=' + encodeURIComponent(query) + '&format=image,plaintext&output=JSON&type=full&width=200', headers: headers}).then(body => {
                var result = JSON.parse(body).queryresult;
                var url = `http://www.wolframalpha.com/input/?i=${encodeURIComponent(query)}`;
                if(!result.success) {
                    var embed = response.embedFactory.createErrorEmbed("No results").setDescription(`Wolfram Alpha returned no results for your query of *${query}*.`).setURL(url);
                    if(result.tips) {
                        embed.addField("Tips", result.tips.text);
                    }
                    return response.edit(postedMessage, postedMessage.content, embed);
                }
                var embed = response.embedFactory.createSuccessEmbed("Results").setDescription(`Wolfram Alpha results for *${query}*:` + (result.pods.length > 6 ? `\n*Some results were truncated. [Click here](${url}) to view the full results.*` : "")).setURL(url);
                if(result.pods) {
                    result.pods.slice(0, 6).forEach(pod => {
                        var text = pod.subpods.map(subpod => {
                            return subpod.plaintext != "" ? (subpod.title != "" ? `*${subpod.title}: ` : "") + subpod.plaintext : null
                        }).join("\n")
                        if(text != "") embed.addField(pod.title, text, true);
                    })
                }
                if(result.assumptions) embed.addField("Assuming that", `*${result.assumptions.word}* is *${result.assumptions.values[0].desc}.*`);
                response.edit(postedMessage, postedMessage.content, embed, true).catch(err => {
                    client.log(err, true);
                    response.edit(postedMessage, postedMessage.content, response.embedFactory.createInformativeEmbed("Continue your query").setDescription("The results of your query were too large to display here. Please continue your query on Wolfram Alpha's website.").setURL(url).addField("Results URL", url), true);
                });
            }).catch(err => {
                client.log(err, true);
                response.edit(postedMessage, postedMessage.content, response.embedFactory.createErrorEmbed().setDescription("An error occurred while trying to submit your query to Wolfram Alpha."));
            });
        }).catch(e => client.log(e, true));
    }, [], false, true
);