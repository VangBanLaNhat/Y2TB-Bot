const fetch = require("node-fetch");
const path = require("path");
var log = require(path.join(__dirname,"..", "..", "util", "log.js"));

async function csim(event, api){
    var data = await fetch(encodeURI(`https://api.simsimi.net/v1/?text=${event.body}&lang=vi_VN`));
    var json = await data.json();
    var s = json.success;
    if (s != undefined) {
		api.sendMessage("TEST BOT: " + s, event.threadID, event.messageID);
	}
	return s;
}

module.exports = csim;