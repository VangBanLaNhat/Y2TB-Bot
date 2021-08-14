const login = require("fca-unofficial");
const fs = require("fs");
const path = require("path");
const listen = require(path.join(__dirname, "listen.js"))
var log = require(path.join(__dirname, "..", "util", "log.js"));

let prefix = "/";

module.exports = (appState, loginOptions) => {
    var opts = loginOptions;
    delete opts["userAgent"];
	
    login({ appState }, opts, (err, api) => {
        if (err) {
            fs.unlinkSync(path.join(__dirname, "..", "..", "udata", "fbstate.json"));
            log.err("Login", err);
        }


        log.log("Manager","Login successfuly!");
		var stopListening = api.listenMqtt((err, event) => {
			listen(err, event, api);
		});
    })
}
